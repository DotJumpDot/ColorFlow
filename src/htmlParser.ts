import * as vscode from "vscode";
import { Parser, Handler } from "htmlparser2";
import { ParsedStyles, extractColorProperties, parseStyleString } from "./styleParser";

export interface HTMLElement {
  tagName: string;
  attributes: { [name: string]: string };
  styles: ParsedStyles;
  colors: {
    color?: string;
    backgroundColor?: string;
  };
  classes: string[];
  startPosition: vscode.Position;
  endPosition: vscode.Position;
  textStartPosition?: vscode.Position;
  textEndPosition?: vscode.Position;
  textContent?: string;
  textNodes: { text: string; range: vscode.Range }[];
  parent?: HTMLElement;
  children: HTMLElement[];
  hasInlineStyle: boolean;
}

export interface ParseResult {
  elements: HTMLElement[];
  root: HTMLElement | null;
}

export function parseHTMLDocument(document: vscode.TextDocument): ParseResult {
  const text = document.getText();
  const elements: HTMLElement[] = [];
  const elementStack: HTMLElement[] = [];
  let root: HTMLElement | null = null;

  const handler: Partial<Handler> = {
    onopentagname(name) {
      // Calculate start index from end index to be more robust
      // endIndex points to the last character of the tag name
      const endIndex = parser.endIndex;
      const startIndex = endIndex - name.length - 1;
      const position = document.positionAt(startIndex);

      const parent = elementStack.length > 0 ? elementStack[elementStack.length - 1] : undefined;

      const element: HTMLElement = {
        tagName: name,
        attributes: {},
        styles: {},
        colors: {},
        classes: [],
        startPosition: position,
        endPosition: position,
        textNodes: [],
        parent: parent,
        children: [],
        hasInlineStyle: false,
      };

      if (element.parent) {
        element.parent.children.push(element);
      } else {
        root = element;
      }

      elementStack.push(element);
      elements.push(element);
    },

    onopentag(name, attribs) {
      if (elementStack.length > 0) {
        const element = elementStack[elementStack.length - 1];
        element.attributes = attribs;
        element.styles = attribs.style ? parseStyleString(attribs.style) : {};
        element.hasInlineStyle = !!attribs.style;
        element.classes = attribs.className ? attribs.className.split(/\s+/).filter((c) => c) : (attribs.class ? attribs.class.split(/\s+/).filter((c) => c) : []);

        const colors = extractColorProperties(element.styles);

        element.colors = colors;
      }
    },

    ontext(data) {
      if (elementStack.length > 0) {
        const currentElement = elementStack[elementStack.length - 1];

        // Calculate start index from end index to be more robust
        // endIndex points to the last character of the text data
        const endIndex = parser.endIndex;
        const startIndex = endIndex - data.length + 1;

        const textStartPosition = document.positionAt(startIndex);
        // endIndex + 1 because VS Code Range is exclusive at the end
        const textEndPosition = document.positionAt(endIndex + 1);
        const range = new vscode.Range(textStartPosition, textEndPosition);

        // Add to text nodes
        currentElement.textNodes.push({ text: data, range });

        // Update legacy fields
        if (currentElement.textStartPosition === undefined) {
          currentElement.textContent = data;
          currentElement.textStartPosition = textStartPosition;
          currentElement.textEndPosition = textEndPosition;
        } else {
          currentElement.textContent = (currentElement.textContent || "") + data;
          currentElement.textEndPosition = textEndPosition;
        }
      }
    },

    onclosetag(name) {
      if (elementStack.length > 0) {
        const element = elementStack.pop();
        if (element) {
          const endIndex = parser.endIndex + 1;
          element.endPosition = document.positionAt(endIndex);
        }
      }
    },
  };

  const parser = new Parser(handler);
  parser.write(text);
  parser.end();

  return { elements, root };
}

export function findElementsByColor(
  elements: HTMLElement[],
  colorType: "color" | "backgroundColor"
): HTMLElement[] {
  return elements.filter((element) => element.colors[colorType] !== undefined);
}

export function getElementTextRange(element: HTMLElement): vscode.Range | null {
  if (!element.textStartPosition || !element.textEndPosition) {
    return null;
  }

  return new vscode.Range(element.textStartPosition, element.textEndPosition);
}

export function getElementFullRange(element: HTMLElement): vscode.Range {
  return new vscode.Range(element.startPosition, element.endPosition);
}
