import * as vscode from "vscode";
import { parseHTMLDocument } from "./htmlParser";
import { SettingsManager } from "./settingsManager";
import { DecorationManager } from "./decorationManager";

let settingsManager: SettingsManager;
let decorationManager: DecorationManager;
let updateTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Color Flow extension is now active!");

  settingsManager = new SettingsManager();
  decorationManager = new DecorationManager();

  const updateDecorations = (editor: vscode.TextEditor) => {
    if (!editor) {
      return;
    }

    const settings = settingsManager.getSettings();

    if (!settings.enabled) {
      decorationManager.clearDecorations(editor);
      return;
    }

    const { elements } = parseHTMLDocument(editor.document);
    decorationManager.applyDecorations(editor, elements, settings);
  };

  const debouncedUpdate = (editor: vscode.TextEditor) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      updateDecorations(editor);
    }, 100);
  };

  const handleDocumentChange = (event: vscode.TextDocumentChangeEvent) => {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.document === event.document) {
      debouncedUpdate(editor);
    }
  };

  const handleActiveEditorChange = (editor: vscode.TextEditor | undefined) => {
    if (editor) {
      updateDecorations(editor);
    }
  };

  const disposable = [
    vscode.workspace.onDidChangeTextDocument(handleDocumentChange),
    vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange),

    vscode.commands.registerCommand("colorFlow.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "colorFlow");
    }),

    vscode.commands.registerCommand("colorFlow.toggle", () => {
      settingsManager.toggleEnabled();
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
      }

      const status = settingsManager.getSettings().enabled ? "enabled" : "disabled";
      vscode.window.showInformationMessage(`Color Flow is now ${status}`);
    }),

    vscode.commands.registerCommand("colorFlow.refresh", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
        vscode.window.showInformationMessage("Color Flow decorations refreshed");
      }
    }),

    settingsManager.onSettingsChanged(() => {
      decorationManager.clearCache();
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
      }
    }),
  ];

  context.subscriptions.push(...disposable);

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    updateDecorations(editor);
  }
}

export function deactivate() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  if (settingsManager) {
    settingsManager.dispose();
  }

  if (decorationManager) {
    decorationManager.dispose();
  }
}
