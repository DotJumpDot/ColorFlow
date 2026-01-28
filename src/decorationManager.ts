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
      if (!element.hasInlineStyle) {
        continue;
      }

      const colorValue = element.colors.color || element.colors.backgroundColor;

      if (!colorValue) {
        continue;
      }

      const backgroundColor = convertToRGBA(colorValue, settings.opacity);

      if (!backgroundColor) {
        continue;
      }

      const range = this.getRangeForElement(element, settings.highlightMode);

      if (!range) {
        continue;
      }

      if (!decorationsByColor.has(backgroundColor)) {
        decorationsByColor.set(backgroundColor, []);
      }

      decorationsByColor.get(backgroundColor)!.push(range);
    }

    this.clearDecorations(editor);

    for (const [backgroundColor, ranges] of decorationsByColor) {
      const decoration = this.getOrCreateDecoration(backgroundColor, settings);
      editor.setDecorations(decoration, ranges);
    }
  }

  private getRangeForElement(element: HTMLElement, mode: HighlightMode): vscode.Range | null {
    switch (mode) {
      case "full-line":
        return new vscode.Range(
          new vscode.Position(element.startPosition.line, 0),
          new vscode.Position(element.endPosition.line, 0)
        );

      case "word-only":
        const textRange = getElementTextRange(element);
        if (!textRange) {
          return null;
        }
        return this.trimWhitespaceRange(textRange, element.textContent || "");

      case "char-range":
      default:
        return getElementTextRange(element);
    }
  }

  private trimWhitespaceRange(range: vscode.Range, text: string): vscode.Range {
    const trimmedText = text.trimLeft();
    const leadingWhitespace = text.length - trimmedText.length;
    const trailingWhitespace = trimmedText.trimRight().length - trimmedText.length;

    const startOffset = leadingWhitespace;
    const endOffset = text.length - trailingWhitespace;

    const startPosition = new vscode.Position(
      range.start.line,
      range.start.character + startOffset
    );

    const endPosition = new vscode.Position(range.end.line, range.start.character + endOffset);

    return new vscode.Range(startPosition, endPosition);
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
