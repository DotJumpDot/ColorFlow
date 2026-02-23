jest.mock("vscode", () => ({
  Position: class {
    constructor(public line: number, public character: number) {}
  },
  Range: class {
    constructor(public start: any, public end: any) {}
  },
  TextEditorDecorationType: class {
    constructor(public options: any) {}
  },
  Uri: {
    parse: () => ({})
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  window: {
    createStatusBarItem: () => ({}),
    showInformationMessage: jest.fn(),
    createTextEditorDecorationType: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  workspace: {
    onDidChangeTextDocument: jest.fn(),
    onDidChangeActiveTextEditor: jest.fn(),
    onDidCloseTextDocument: jest.fn()
  }
}));

export {};
