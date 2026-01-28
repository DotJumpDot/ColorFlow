import * as vscode from "vscode";
import { convertToRGBA } from "./colorConverter";
import { HTMLElement, getElementTextRange, getElementFullRange } from "./htmlParser";
import { ColorFlowSettings, HighlightMode } from "./settingsManager";

export class DecorationManager {
  private decorationCache: Map<string, vscode.TextEditorDecorationType> = new Map();
  private disposables: vscode.Disposable[] = [];

  constructor() {}

  applyDecorations(
    editor: vscode.TextEditor,
    elements: HTMLElement[],
    settings: ColorFlowSettings
  ): void {
    if (!settings.enabled) {
      this.clearDecorations(editor);
      return;
    }

    const decorationsByColor: Map<string, vscode.Range[]> = new Map();

    for (const element of elements) {
      const colorValue = element.colors.color || element.colors.backgroundColor;

      if (!colorValue) {
        continue;
      }

      // For full-line mode, we only highlight the element that actually has the inline style
      // to avoid redundant highlights of the same lines by children.
      // For other modes, we want to highlight text nodes of children that inherit the color.
      if (settings.highlightMode === "full-line" && !element.hasInlineStyle) {
        continue;
      }

      // If the element has NO inline style but inherits a color, we should check if
      // it's just inheriting the SAME color as its parent's text color.
      // If it is, and we are in word-only mode, we might want to let the parent handle it
      // OR we handle it here.
      // However, the issue described is that "inherited text" is NOT highlighting.
      // My previous fix for char-range handled inheritance by default because I iterate all elements.
      // But wait, the loop `for (const element of elements)` iterates ALL elements, including children.

      // The issue is likely precedence.
      // If parent has background-color (purple) and child inherits color (teal).
      // Parent highlights its background. Child highlights its text.
      // If child is ON TOP of parent, child highlight should be visible.
      // But if child is inheriting, `element.colors` might be populated.

      const backgroundColor = convertToRGBA(colorValue, settings.opacity);

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
        return element.textNodes.flatMap((node) =>
          this.getWordRanges(document, node.range, node.text)
        );

      case "char-range":
      default:
        const charRanges: vscode.Range[] = [];
        for (const node of element.textNodes) {
          const trimmed = this.trimWhitespaceRange(document, node.range, node.text);
          if (!trimmed.isEmpty) {
            charRanges.push(trimmed);
          }
        }
        return charRanges;
    }
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

    const decorationOptions: vscode.DecorationRenderOptions = {
      backgroundColor: backgroundColor,
    };

    if (settings.enableBorder) {
      const borderColor =
        settings.borderColor === "currentColor" ? backgroundColor : settings.borderColor;

      decorationOptions.borderColor = borderColor;
      decorationOptions.borderWidth = "1px";
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
