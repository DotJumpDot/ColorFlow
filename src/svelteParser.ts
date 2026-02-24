import * as vscode from "vscode";
import { Parser, Handler } from "htmlparser2";
import { HTMLElement, ParseResult } from "./htmlParser";
import { extractColorProperties, parseStyleString } from "./styleParser";

/**
 * Checks if an expression is complex code that should not be highlighted.
 */
function isComplexExpression(content: string): boolean {
  if (content.includes("\n")) return true;
  if (content.includes("=>")) return true;

  const complexPatterns = [
    "=>",
    "function",
    ".map(",
    ".filter(",
    ".reduce(",
    "&&",
    "||",
    "?",
    ";",
    "return",
    "const ",
    "let ",
    "var ",
  ];
  return complexPatterns.some((pattern) => content.includes(pattern));
}

/**
 * Sanitizes template syntax for both Svelte and Vue files.
 * - Svelte: { } blocks - entire control flow blocks replaced with spaces to prevent highlighting
 * - Simple expressions like {variable} are kept as-is
 * - Vue: v- directives - control flow directives replaced with spaces
 * Returns sanitized text
 */
function sanitizeSvelte(text: string): string {
  let sanitized = "";
  let pos = 0;
  let inTag = false;

  // Svelte control flow keywords that indicate entire block should be ignored
  const controlFlowKeywords = [
    "#else if",
    ":else if",
    "else if",
    "#snippet",
    "#render",
    "#key",
    "#if",
    "/if",
    ":else",
    "#each",
    "/each",
    "#await",
    ":then",
    ":catch",
    "/await",
    "@render",
    "@const",
    "@debug",
    "@html",
    "@store",
  ];

  while (pos < text.length) {
    if (text[pos] === "<") {
      inTag = true;
      sanitized += text[pos];
      pos++;
    } else if (text[pos] === ">") {
      inTag = false;
      sanitized += text[pos];
      pos++;
    } else if (text[pos] === "{") {
      let depth = 1;
      let j = pos + 1;
      let inString: string | null = null;

      while (j < text.length && depth > 0) {
        const char = text[j];
        if (inString) {
          if (char === inString && (j === 0 || text[j - 1] !== "\\")) {
            inString = null;
          }
        } else {
          if (char === '"' || char === "'" || char === "`") {
            inString = char;
          } else if (char === "{") {
            depth++;
          } else if (char === "}") {
            depth--;
          }
        }
        if (depth > 0) j++;
      }

      const content = text.substring(pos + 1, j);
      const trimmed = content.trim();

      // Check if this is a control flow block
      let isControlFlow = false;
      for (const keyword of controlFlowKeywords) {
        if (trimmed.startsWith(keyword)) {
          isControlFlow = true;
          break;
        }
      }

      // Check if this is a complex expression (like arrow functions)
      const isComplex = isComplexExpression(content);

      if (isControlFlow || isComplex || inTag) {
        // Replace entire control flow block with spaces
        sanitized += " ".repeat(j - pos + 1);
      } else {
        // Keep expression as-is for proper highlighting
        sanitized += "{" + content + "}";
      }

      pos = j + 1;
    } else {
      sanitized += text[pos];
      pos++;
    }
  }

  return sanitized;
}

export function parseSvelteDocument(document: vscode.TextDocument): ParseResult {
  const originalText = document.getText();

  const sanitizedText = sanitizeSvelte(originalText);

  const elements: HTMLElement[] = [];
  const elementStack: HTMLElement[] = [];
  let root: HTMLElement | null = null;

  const handler: Partial<Handler> = {
    onopentagname(name) {
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

        const tagEndIndex = parser.endIndex;
        const tagStartIndex = document.offsetAt(element.startPosition);

        const originalTagContent = originalText.substring(tagStartIndex, tagEndIndex + 1);

        const classMatch = originalTagContent.match(/class=(?:["']([^"']+)["']|\{([^}]+)\})/);
        if (classMatch) {
          const classValue = classMatch[1] || classMatch[2];
          element.classes = classValue.split(/\s+/).filter((c) => c);
        } else if (attribs.class) {
          element.classes = attribs.class.split(/\s+/).filter((c) => c);
        }

        const styleMatch = originalTagContent.match(/style=(?:["']([^"']+)["']|\{([^}]+)\})/);
        if (styleMatch) {
          const styleValue = styleMatch[1] || styleMatch[2];
          if (styleValue && styleValue.trim().length > 0) {
            element.hasInlineStyle = true;
            const styles = parseStyleString(styleValue);
            element.styles = { ...element.styles, ...styles };

            const colors = extractColorProperties(styles);
            if (colors.color) element.colors.color = colors.color;
            if (colors.backgroundColor) element.colors.backgroundColor = colors.backgroundColor;
          }
        } else if (
          attribs.style &&
          attribs.style.trim().length > 0 &&
          !/^\s+$/.test(attribs.style)
        ) {
          element.hasInlineStyle = true;
          const styles = parseStyleString(attribs.style);
          element.styles = { ...element.styles, ...styles };

          const colors = extractColorProperties(styles);
          if (colors.color) element.colors.color = colors.color;
          if (colors.backgroundColor) element.colors.backgroundColor = colors.backgroundColor;
        }
      }
    },

    ontext(data) {
      if (elementStack.length > 0) {
        const currentElement = elementStack[elementStack.length - 1];

        const endIndex = parser.endIndex;
        const startIndex = endIndex - data.length + 1;

        const textStartPosition = document.positionAt(startIndex);
        const textEndPosition = document.positionAt(endIndex + 1);
        const range = new vscode.Range(textStartPosition, textEndPosition);

        const sanitizedTextContent = sanitizedText.substring(startIndex, endIndex + 1);

        currentElement.textNodes.push({ text: sanitizedTextContent, range });

        if (currentElement.textStartPosition === undefined) {
          currentElement.textContent = sanitizedTextContent;
          currentElement.textStartPosition = textStartPosition;
          currentElement.textEndPosition = textEndPosition;
        } else {
          currentElement.textContent = (currentElement.textContent || "") + sanitizedTextContent;
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
  parser.write(sanitizedText);
  parser.end();

  return { elements, root };
}
