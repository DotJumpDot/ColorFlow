export class Position {
  constructor(public line: number, public character: number) {}
}

export class Range {
  constructor(public start: Position, public end: Position) {}
}

export class TextEditorDecorationType {
  constructor(public options: any) {}
}

export const Uri = {
  parse: (uri: string) => ({})
};

export const StatusBarAlignment = {
  Left: 1,
  Right: 2
};

export const window = {
  createStatusBarItem: () => ({ show: jest.fn(), hide: jest.fn() }),
  showInformationMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn()
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn()
};

export const workspace = {
  onDidChangeTextDocument: jest.fn(),
  onDidChangeActiveTextEditor: jest.fn(),
  onDidCloseTextDocument: jest.fn()
};
