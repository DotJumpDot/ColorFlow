import * as vscode from "vscode";
import { Parser, Handler } from "htmlparser2";
import { HTMLElement, ParseResult } from "./htmlParser";
import { extractColorProperties, parseStyleString } from "./styleParser";

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
 * Logic patterns that indicate this is code/logic, not just a simple value.
 */
function isComplexExpression(content: string): boolean {
  if (content.includes("\n")) return true;
  if (content.includes("{") || content.includes("}")) return true;

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
 * Recursively processes a JSX { } block and returns a masked version.
 * Complex logic is masked with spaces to avoid highlighting.
 * Simple expressions are masked with underscores to allow highlighting.
 * Tags and their children are preserved for the parser.
 */
function processJSXBlock(text: string, start: number): { masked: string; end: number } {
  let depth = 1;
  let j = start + 1;
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

  const content = text.substring(start + 1, j);

  // If it's complex or contains tags, we need to be careful
  if (isComplexExpression(content) || content.includes("<")) {
    let masked = "{";
    let k = 0;
    let inTag = false;
    let tagStack: string[] = [];

    while (k < content.length) {
      const char = content[k];

      if (char === "<") {
        inTag = true;
        masked += "<";
        k++;

        // Peek for tag type
        if (content[k] === "/") {
          // Closing tag </name>
          masked += "/";
          k++;
          const match = content.substring(k).match(/^([a-zA-Z0-9:-]*)/);
          const tagName = match ? match[1] : "";
          if (tagName) {
            if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
              tagStack.pop();
            }
            masked += tagName;
            k += tagName.length;
          }
        } else if (content[k] === ">") {
          // Fragment opening <>
          tagStack.push("");
          masked += ">";
          k++;
          inTag = false;
        } else {
          // Opening tag <name or self-closing fragment </> (though </> is rare)
          const match = content.substring(k).match(/^([a-zA-Z0-9:-]*)/);
          const tagName = match ? match[1] : "";
          if (tagName) {
            tagStack.push(tagName);
            masked += tagName;
            k += tagName.length;
          }
        }
        continue;
      }

      if (char === ">" && inTag) {
        // Check for self-closing tag <br />
        if (content[k - 1] === "/") {
          tagStack.pop();
        }
        inTag = false;
        masked += ">";
        k++;
        continue;
      }

      if (char === "{" && (inTag || tagStack.length > 0)) {
        // Nested block inside a tag or as a child of a tag
        const nested = processJSXBlock(content, k);
        masked += nested.masked;
        k = nested.end + 1;
        continue;
      }

      if (char === "{" && !inTag && tagStack.length === 0) {
        // Nested block in logic area (e.g. { { ... } })
        const nested = processJSXBlock(content, k);
        masked += nested.masked;
        k = nested.end + 1;
        continue;
      }

      // Regular character
      if (inTag || tagStack.length > 0) {
        masked += char; // Preserve JSX content
      } else {
        // Logic part - replace with space (preserve newlines for offsets)
        masked += char === "\n" || char === "\r" ? char : " ";
      }
      k++;
    }
    return { masked: masked + "}", end: j };
  } else {
    // Simple expression - mask with underscores to keep it "highlightable" as a word
    return { masked: "{" + "_".repeat(content.length) + "}", end: j };
  }
}

/**
 * Sanitizes JSX/TSX text by masking logic blocks while preserving tags.
 * This prevents htmlparser2 from breaking on characters like '>' inside logic
 * and also prevents the decoration manager from highlighting complex code.
 */
function sanitizeJSX(text: string): string {
  let sanitized = "";
  let i = 0;

  while (i < text.length) {
    if (text[i] === "{") {
      const { masked, end } = processJSXBlock(text, i);
      sanitized += masked;
      i = end + 1;
    } else {
      sanitized += text[i];
      i++;
    }
  }
  return sanitized;
}

export function parseReactDocument(document: vscode.TextDocument): ParseResult {
  const originalText = document.getText();

  // Sanitize text: mask logic blocks { ... } to avoid breaking htmlparser2
  // and to prevent highlighting of complex logic.
  const sanitizedText = sanitizeJSX(originalText);

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
          const styleBody = styleMatch[1];
          const objStyles = parseReactStyleObject(styleBody);
          element.styles = { ...element.styles, ...objStyles };

          const colors = extractColorProperties(objStyles);
          if (colors.color) element.colors.color = colors.color;
          if (colors.backgroundColor) element.colors.backgroundColor = colors.backgroundColor;
        } else if (attribs.style && attribs.style.trim().length > 0) {
          // Handle normal style="..." if present and NOT our sanitized spaces
          // Our sanitized style contains only spaces.
          const styles = parseStyleString(attribs.style);
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
