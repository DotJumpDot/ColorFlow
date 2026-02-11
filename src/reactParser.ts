import * as vscode from "vscode";
import { Parser, Handler } from "htmlparser2";
import { HTMLElement, ParseResult } from "./htmlParser";
import { extractColorProperties } from "./styleParser";

const STYLE_OBJECT_REGEX = /style=\{\{([\s\S]*?)\}\}/g;

export function parseReactStyleObject(styleString: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {};

  // Find all property: value patterns
  // We allow the value to be complex (like conditionals), and we try to extract
  // the first color-like string we find in it.
  const propertyRegex = /(\w+)\s*:\s*([^,}]+)/g;
  let match;

  while ((match = propertyRegex.exec(styleString)) !== null) {
    const property = match[1];
    const complexValue = match[2];

    // Regex for hex, rgb, rgba, hsl, hsla, or color names in quotes
    const colorMatch = complexValue.match(
      /['"`](#[0-9a-fA-F]{3,8}|rgba?\(.*?\)|hsla?\(.*?\)|[a-zA-Z]+)['"`]/
    );
    if (colorMatch) {
      styles[property] = colorMatch[1];
    }
  }
  return styles;
}

/**
 * Sanitizes JSX/TSX text by replacing attribute values that use { ... } with underscores.
 * This prevents htmlparser2 from breaking on characters like '>' inside JSX expressions
 * (common in arrow functions like onClick={() => ...}) while they are inside a tag.
 * Length is preserved to keep document offsets accurate.
 */
function sanitizeJSXAttributes(text: string): string {
  const regex = /([a-zA-Z0-9-]+\s*=\s*\{)/g;
  let match;
  let lastIndex = 0;
  let sanitizedText = "";

  while ((match = regex.exec(text)) !== null) {
    // Add text up to the start of the attribute value
    sanitizedText += text.substring(lastIndex, match.index + match[1].length);

    let i = match.index + match[1].length;
    let depth = 1;
    let inString: string | null = null;
    let start = i;

    while (i < text.length && depth > 0) {
      const char = text[i];
      if (inString) {
        if (char === inString && (i === 0 || text[i - 1] !== "\\")) {
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
      i++;
    }

    // Replace the content of the attribute value with underscores, keeping the closing brace
    const contentLen = i - 1 - start;
    sanitizedText += "_".repeat(Math.max(0, contentLen)) + "}";
    lastIndex = i;
  }

  // Add the remaining text
  sanitizedText += text.substring(lastIndex);
  return sanitizedText;
}

export function parseReactDocument(document: vscode.TextDocument): ParseResult {
  const originalText = document.getText();

  // Sanitize text: replace JSX attribute values { ... } with underscores to avoid breaking htmlparser2.
  // This prevents the parser from getting confused by '>' in arrow functions inside attributes.
  // We keep the length the same to preserve offsets.
  const sanitizedText = sanitizeJSXAttributes(originalText);

  const elements: HTMLElement[] = [];
  const elementStack: HTMLElement[] = [];
  let root: HTMLElement | null = null;

  const handler: Partial<Handler> = {
    onopentagname(name) {
      // Calculate start index from end index (points to last char of tag name)
      // Note: parser.startIndex is available in newer htmlparser2 but this method is used in htmlParser.ts
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

        // Recover original attributes from original text
        // We use the element's start position (calculated in onopentagname)
        const tagStartIndex = document.offsetAt(element.startPosition);
        // parser.endIndex points to the end of the tag '>'
        const tagEndIndex = parser.endIndex;

        // Extract the full tag string from the ORIGINAL text
        const originalTagContent = originalText.substring(tagStartIndex, tagEndIndex + 1);

        // Parse className (React) or class (HTML fallback)
        const classMatch = originalTagContent.match(/className=\{?['"]([^'"]+)['"]\}?/);
        if (classMatch) {
          element.classes = classMatch[1].split(/\s+/).filter((c) => c);
        } else if (attribs.class) {
          element.classes = attribs.class.split(/\s+/).filter((c) => c);
        }

        // Parse style
        // We look for style={{...}} in the original tag content
        const styleRegex = /style=\{\{([\s\S]*?)\}\}/;
        const styleMatch = originalTagContent.match(styleRegex);

        if (styleMatch) {
          element.hasInlineStyle = true;
          const styleBody = styleMatch[1]; // Content inside {{ }}
          element.styles = parseReactStyleObject(styleBody);

          const colorValue = element.styles.color;
          const bgColorValue = element.styles.backgroundColor || element.styles.background;

          if (colorValue) element.colors.color = colorValue;
          if (bgColorValue) element.colors.backgroundColor = bgColorValue;
        } else if (attribs.style && attribs.style.trim().length > 0) {
          // Handle normal style="..." if present and NOT our sanitized spaces
          // Our sanitized style contains only spaces.
          const styles = parseSimpleStyle(attribs.style);
          element.styles = { ...element.styles, ...styles };

          // Extract colors from parsed styles
          const colors = extractColorProperties(styles);
          if (colors.color) element.colors.color = colors.color;
          if (colors.backgroundColor) element.colors.backgroundColor = colors.backgroundColor;
        }
      }
    },

    ontext(data) {
      if (elementStack.length > 0) {
        const currentElement = elementStack[elementStack.length - 1];
        // Calculate start index from end index
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
  parser.write(sanitizedText);
  parser.end();

  return { elements, root };
}

function parseSimpleStyle(styleString: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {};
  const declarations = styleString.split(";");
  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) continue;
    const property = declaration.substring(0, colonIndex).trim();
    const value = declaration.substring(colonIndex + 1).trim();
    if (property && value) styles[property] = value;
  }
  return styles;
}
