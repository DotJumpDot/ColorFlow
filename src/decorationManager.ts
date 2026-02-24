import * as vscode from "vscode";
import { convertToRGBA } from "./colorConverter";
import { HTMLElement, getElementTextRange, getElementFullRange } from "./htmlParser";
import { ColorFlowSettings, HighlightMode } from "./settingsManager";
import { ClassColorDefinition, CSSVariableDefinition } from "./cssParser";
import { resolveCSSVariable } from "./styleParser";

export class DecorationManager {
  private decorationCache: Map<string, vscode.TextEditorDecorationType> = new Map();
  private disposables: vscode.Disposable[] = [];

  constructor() {}

  applyDecorations(
    editor: vscode.TextEditor,
    elements: HTMLElement[],
    settings: ColorFlowSettings,
    classColorMap?: Map<string, ClassColorDefinition>,
    cssVariablesMap?: Map<string, CSSVariableDefinition>
  ): void {
    if (!settings.enabled) {
      this.clearDecorations(editor);
      return;
    }

    if (settings.hideBackgroundHighlight && !settings.enableBorder) {
      this.clearDecorations(editor);
      return;
    }

    const decorationsByColor: Map<string, vscode.Range[]> = new Map();

    for (const element of elements) {
      const effectiveColor = this.getEffectiveColor(
        element,
        classColorMap,
        cssVariablesMap,
        settings.enableClassHighlighting
      );

      if (!effectiveColor) {
        continue;
      }

      const backgroundColor = convertToRGBA(effectiveColor, settings.opacity);

      if (!backgroundColor) {
        continue;
      }

      const ranges = this.getRangesForElement(editor.document, element, settings.highlightMode);

      if (ranges.length === 0) {
        continue;
      }

      if (!decorationsByColor.has(backgroundColor)) {
        decorationsByColor.set(backgroundColor, []);
      }

      decorationsByColor.get(backgroundColor)!.push(...ranges);
    }

    this.clearDecorations(editor);

    for (const [backgroundColor, ranges] of decorationsByColor) {
      const decoration = this.getOrCreateDecoration(backgroundColor, settings);
      editor.setDecorations(decoration, ranges);
    }
  }

  private getEffectiveColor(
    element: HTMLElement,
    classColorMap?: Map<string, ClassColorDefinition>,
    cssVariablesMap?: Map<string, CSSVariableDefinition>,
    enableClassHighlighting?: boolean
  ): string | null {
    let colorValue: string | null = null;

    if (element.colors.color) {
      colorValue = element.colors.color;
    } else if (element.colors.backgroundColor) {
      colorValue = element.colors.backgroundColor;
    }

    if (cssVariablesMap && colorValue) {
      colorValue = resolveCSSVariable(colorValue, cssVariablesMap);
    }

    if (enableClassHighlighting && classColorMap && element.classes.length > 0 && !colorValue) {
      for (const className of element.classes) {
        const classDef = classColorMap.get(className);
        if (classDef) {
          let classColor = classDef.color;
          let classBgColor = classDef.backgroundColor;

          if (cssVariablesMap) {
            if (classColor) {
              classColor = resolveCSSVariable(classColor, cssVariablesMap);
            }
            if (classBgColor) {
              classBgColor = resolveCSSVariable(classBgColor, cssVariablesMap);
            }
          }

          if (classColor && !colorValue) {
            colorValue = classColor;
          }
          if (!colorValue && classBgColor) {
            colorValue = classBgColor;
          }
        }
      }
    }

    if (colorValue) {
      return colorValue;
    }

    if (element.parent) {
      return this.getEffectiveColor(
        element.parent,
        classColorMap,
        cssVariablesMap,
        enableClassHighlighting
      );
    }

    return null;
  }

  private getRangesForElement(
    document: vscode.TextDocument,
    element: HTMLElement,
    mode: HighlightMode
  ): vscode.Range[] {
    switch (mode) {
      case "full-line":
        const ranges: vscode.Range[] = [];
        for (let i = element.startPosition.line; i <= element.endPosition.line; i++) {
          const line = document.lineAt(i);
          ranges.push(line.rangeIncludingLineBreak);
        }
        return ranges;

      case "word-only":
        return element.textNodes
          .filter((node) => !this.isPureCodeSyntax(node.text))
          .flatMap((node) => this.getWordRanges(document, node.range, node.text));

      case "char-range":
      default:
        const charRanges: vscode.Range[] = [];
        for (const node of element.textNodes) {
          if (this.isPureCodeSyntax(node.text)) {
            continue;
          }
          const trimmed = this.trimWhitespaceRange(document, node.range, node.text);
          if (!trimmed.isEmpty) {
            charRanges.push(trimmed);
          }
        }
        return charRanges;
    }
  }

  private isPureCodeSyntax(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return true;

    // Match sanitized JSX/Svelte expressions (underscores representing {expression})
    // These were originally JSX/Svelte expressions and should NOT be filtered out
    if (/^_+$/.test(trimmed)) return false;

    // Match JSX expressions with single identifier (e.g., {title}, {children})
    // These are NOT pure code syntax - they render as content
    if (/^\{[\w.$]+\}$/.test(trimmed)) return false;

    // Match pure code syntax characters (brackets, braces, parentheses, etc.)
    if (/^[\s\r\n{}();,_]*$/.test(trimmed)) return true;

    // Match common JavaScript/TypeScript keywords and patterns
    // Only filter if it's actual code syntax, not just a variable name
    const codePatterns = [
      /^function\s+\w+\s*\(/,
      /^const\s+\[.*\]\s*=/,
      /^const\s+\w+\s*=/,
      /^let\s+\[.*\]\s*=/,
      /^let\s+\w+\s*=/,
      /^var\s+\[.*\]\s*=/,
      /^var\s+\w+\s*=/,
      /^import\s+.*from/,
      /^export\s+(default|const|function|class)/,
      /^return\s+[^{].*;?$/,
      /^for\s*\(\s*\w+\s*of\s*/,
      /^if\s*\(\s*\w+.*\)/,
      /^else\s*{/,
      /^try\s*{/,
      /^catch\s*\(\s*\w+/,
      /^\w+\s*\(\s*\w+\s*\)\s*=>/,
      /^\w+\s*\(\s*\w+\s*\)\s*{/,
      /^await\s+\w+\s*=/,
      /^async\s+function/,
      /^async\s*\(\s*\w+\s*\)\s*=>/,
      /^class\s+\w+\s*\{/,
      /^\w+\[\]\s*=\s*\w+/,
    ];

    return codePatterns.some(pattern => pattern.test(trimmed));
  }

  private getWordRanges(
    document: vscode.TextDocument,
    range: vscode.Range,
    text: string
  ): vscode.Range[] {
    const ranges: vscode.Range[] = [];
    const baseOffset = document.offsetAt(range.start);

    // Regex to find words (non-whitespace characters)
    const wordRegex = /\S+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const startOffset = baseOffset + match.index;
      const endOffset = startOffset + match[0].length;
      ranges.push(
        new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset))
      );
    }

    return ranges;
  }

  private trimWhitespaceRange(
    document: vscode.TextDocument,
    range: vscode.Range,
    text: string
  ): vscode.Range {
    const trimmedLeft = text.trimStart();
    const leadingWhitespaceCount = text.length - trimmedLeft.length;
    const trimmedBoth = trimmedLeft.trimEnd();
    const trailingWhitespaceCount = trimmedLeft.length - trimmedBoth.length;

    const startOffset = document.offsetAt(range.start) + leadingWhitespaceCount;
    const endOffset = document.offsetAt(range.end) - trailingWhitespaceCount;

    if (startOffset >= endOffset) {
      return new vscode.Range(range.start, range.start);
    }

    return new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset));
  }

  private getOrCreateDecoration(
    backgroundColor: string,
    settings: ColorFlowSettings
  ): vscode.TextEditorDecorationType {
    if (this.decorationCache.has(backgroundColor)) {
      return this.decorationCache.get(backgroundColor)!;
    }

    const decorationOptions: vscode.DecorationRenderOptions = {};

    if (!settings.hideBackgroundHighlight) {
      decorationOptions.backgroundColor = backgroundColor;
    }

    if (settings.enableBorder) {
      const borderColor =
        settings.borderColor === "currentColor" ? backgroundColor : settings.borderColor;

      decorationOptions.borderColor = borderColor;
      decorationOptions.borderWidth = settings.borderSize;
      decorationOptions.borderStyle = "solid";
    }

    if (settings.borderRadius && settings.borderRadius !== "0px") {
      decorationOptions.borderRadius = settings.borderRadius;
    }

    const decoration = vscode.window.createTextEditorDecorationType(decorationOptions);
    this.decorationCache.set(backgroundColor, decoration);

    return decoration;
  }

  clearDecorations(editor: vscode.TextEditor): void {
    for (const decoration of this.decorationCache.values()) {
      editor.setDecorations(decoration, []);
    }
  }

  clearCache(): void {
    for (const decoration of this.decorationCache.values()) {
      decoration.dispose();
    }
    this.decorationCache.clear();
  }

  dispose(): void {
    this.clearCache();
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
