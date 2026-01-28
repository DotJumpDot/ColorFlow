import * as vscode from "vscode";
import * as assert from "assert";
import { DecorationManager } from "../src/decorationManager";
import { HTMLElement } from "../src/htmlParser";
import { ColorFlowSettings } from "../src/settingsManager";

suite("DecorationManager Tests", () => {
  let decorationManager: DecorationManager;
  let mockEditor: vscode.TextEditor;

  setup(() => {
    decorationManager = new DecorationManager();
    mockEditor = {} as vscode.TextEditor;
  });

  teardown(() => {
    decorationManager.dispose();
  });

  test("DecorationManager should be created", () => {
    assert.ok(decorationManager);
  });

  test("applyDecorations should apply decorations with color", () => {
    const elements: HTMLElement[] = [
      {
        tagName: "div",
        attributes: {},
        styles: {},
        colors: { color: "red" },
        startPosition: new vscode.Position(0, 0),
        endPosition: new vscode.Position(0, 20),
        textStartPosition: new vscode.Position(0, 5),
        textEndPosition: new vscode.Position(0, 15),
        textContent: "Test content",
        children: [],
        hasInlineStyle: true,
      },
    ];

    const settings: ColorFlowSettings = {
      opacity: 0.5,
      enableBorder: false,
      borderColor: "currentColor",
      borderRadius: "0px",
      highlightMode: "char-range",
      enabled: true,
    };

    decorationManager.applyDecorations(mockEditor, elements, settings);
  });

  test("applyDecorations should clear decorations when disabled", () => {
    const elements: HTMLElement[] = [
      {
        tagName: "div",
        attributes: {},
        styles: {},
        colors: { color: "red" },
        startPosition: new vscode.Position(0, 0),
        endPosition: new vscode.Position(0, 20),
        textStartPosition: new vscode.Position(0, 5),
        textEndPosition: new vscode.Position(0, 15),
        textContent: "Test content",
        children: [],
        hasInlineStyle: true,
      },
    ];

    const settings: ColorFlowSettings = {
      opacity: 0.5,
      enableBorder: false,
      borderColor: "currentColor",
      borderRadius: "0px",
      highlightMode: "char-range",
      enabled: false,
    };

    decorationManager.applyDecorations(mockEditor, elements, settings);
  });

  test("applyDecorations should skip elements without inline styles", () => {
    const elements: HTMLElement[] = [
      {
        tagName: "div",
        attributes: {},
        styles: {},
        colors: {},
        startPosition: new vscode.Position(0, 0),
        endPosition: new vscode.Position(0, 20),
        children: [],
        hasInlineStyle: false,
      },
    ];

    const settings: ColorFlowSettings = {
      opacity: 0.5,
      enableBorder: false,
      borderColor: "currentColor",
      borderRadius: "0px",
      highlightMode: "char-range",
      enabled: true,
    };

    decorationManager.applyDecorations(mockEditor, elements, settings);
  });
});
