import { Parser } from "htmlparser2";

// --- MOCK VSCODE CLASSES ---
class Position {
  constructor(
    public line: number,
    public character: number
  ) {}
  isEqual(other: Position) {
    return this.line === other.line && this.character === other.character;
  }
  isBefore(other: Position) {
    return this.line < other.line || (this.line === other.line && this.character < other.character);
  }
  isAfter(other: Position) {
    return this.line > other.line || (this.line === other.line && this.character > other.character);
  }
}

class Range {
  start: Position;
  end: Position;
  isEmpty: boolean;
  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
    this.isEmpty = start.isEqual(end);
  }
  contains(other: Range) {
    return (
      (this.start.isBefore(other.start) || this.start.isEqual(other.start)) &&
      (this.end.isAfter(other.end) || this.end.isEqual(other.end))
    );
  }
}

class TextDocument {
  constructor(public text: string) {}
  positionAt(offset: number): Position {
    let line = 0;
    let character = 0;
    for (let i = 0; i < offset; i++) {
      if (this.text[i] === "\n") {
        line++;
        character = 0;
      } else {
        character++;
      }
    }
    return new Position(line, character);
  }
  offsetAt(position: Position): number {
    let offset = 0;
    let line = 0;
    let character = 0;
    while (line < position.line || (line === position.line && character < position.character)) {
      if (offset >= this.text.length) break;
      if (this.text[offset] === "\n") {
        line++;
        character = 0;
      } else {
        character++;
      }
      offset++;
    }
    return offset;
  }
}

// --- COPIED LOGIC FROM styleParser.ts ---
function parseStyle(styleString: string): any {
  const styles: any = {};
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

function extractColorProperties(styles: any) {
  const result: any = {};
  if (styles.color) result.color = styles.color;
  if (styles["background-color"]) result.backgroundColor = styles["background-color"];
  if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor;
  return result;
}

// --- COPIED LOGIC FROM htmlParser.ts ---
interface HTMLElement {
  tagName: string;
  attributes: any;
  styles: any;
  colors: any;
  startPosition: Position;
  endPosition: Position;
  textNodes: { text: string; range: Range }[];
  parent?: HTMLElement;
  children: HTMLElement[];
  hasInlineStyle: boolean;
}

const mockText = `<!doctype html>\r
<html>\r
<head>\r
<title>Color Flow Demo</title>\r
</head>\r
<body>\r
<h1 style="color: #ff6b6b">Color Flow Extension Demo</h1>\r
\r
<div style="color: #4ecdc4; margin: 20px">\r
<p style="color: #00ff00">This text has a blue background highlight</p>\r
<p>dsadasdasdasdsadas</p>\r
<p style="color: #f9ca24">This text is highlighted in yellow</p>\r
<p style="color: #6c5ce7">And this one in purple</p>\r
</div>\r
\r
<section style="background-color: #a29bfe; padding: 20px; color: rgb(9, 170, 182)">\r
<h2>Background Colors Work Too!</h2>\r
<p>Both color and background-color are detected</p>\r
</section>\r
\r
<footer style="color: #636e72; margin-top: 40px">\r
<p>Watch me change in real-time!</p>\r
</footer>\r
</body>\r
</html>`;

const document = new TextDocument(mockText);

function parseHTML() {
  const elements: HTMLElement[] = [];
  const elementStack: HTMLElement[] = [];
  let root: HTMLElement | null = null;

  const parser = new Parser({
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
        startPosition: position,
        endPosition: position, // Will be updated
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
        element.styles = attribs.style ? parseStyle(attribs.style) : {};
        element.hasInlineStyle = !!attribs.style;

        const colors = extractColorProperties(element.styles);
        // Inherit colors logic
        element.colors = {
          color: colors.color || element.parent?.colors.color,
          backgroundColor: colors.backgroundColor, // Strict inheritance: no bg inheritance
        };
      }
    },
    ontext(data) {
      if (elementStack.length > 0) {
        const currentElement = elementStack[elementStack.length - 1];
        if (data.trim().length === 0) return; // Skip empty whitespace for cleaner output

        const endIndex = parser.endIndex;
        const startIndex = endIndex - data.length + 1;

        const textStartPosition = document.positionAt(startIndex);
        const textEndPosition = document.positionAt(endIndex + 1);
        const range = new Range(textStartPosition, textEndPosition);

        currentElement.textNodes.push({ text: data, range });
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
  });

  parser.write(mockText);
  parser.end();
  return elements;
}

// --- COPIED LOGIC FROM decorationManager.ts (simplified) ---
function getRangesForElement(element: HTMLElement, mode: string) {
  if (mode === "char-range") {
    if (!element.hasInlineStyle) {
      return element.textNodes.map(
        (n) =>
          `Text: "${n.text.trim()}" [${document.offsetAt(n.range.start)}-${document.offsetAt(n.range.end)}]`
      );
    }

    // Full range subtraction logic
    let currentRanges = [new Range(element.startPosition, element.endPosition)];
    // Assume children are subtracted...
    // For verify, just printing the element range and its children ranges to see if they overlap

    return [
      `Full Element: <${element.tagName}> [${document.offsetAt(element.startPosition)}-${document.offsetAt(element.endPosition)}]`,
      ...element.children.map(
        (c) =>
          `  - Subtract Child: <${c.tagName}> [${document.offsetAt(c.startPosition)}-${document.offsetAt(c.endPosition)}]`
      ),
    ];
  }
  return [];
}

// --- RUN TEST ---
console.log("Running Simulation...");
const elements = parseHTML();

console.log("\n--- CHECKING OFFSETS (Watch me change) ---");
const footerP = elements.find(
  (e) => e.tagName === "p" && e.textNodes.some((n) => n.text.includes("Watch"))
);
if (footerP) {
  const textNode = footerP.textNodes.find((n) => n.text.includes("Watch"));
  if (textNode) {
    const start = document.offsetAt(textNode.range.start);
    const actualText = mockText.substring(start, start + 5);
    console.log(`Expected "Watch", Actual at offset ${start}: "${actualText}"`);
    if (actualText !== "Watch") console.error("FAIL: Offset calculation is wrong!");
    else console.log("PASS: Offset is correct.");
  }
} else {
  console.error("FAIL: Could not find footer paragraph.");
}

console.log("\n--- CHECKING INHERITANCE (Section H2) ---");
const h2 = elements.find(
  (e) => e.tagName === "h2" && e.textNodes.some((n) => n.text.includes("Background"))
);
if (h2) {
  console.log(`H2 Colors: color=${h2.colors.color}, bg=${h2.colors.backgroundColor}`);
  if (h2.colors.color && !h2.colors.backgroundColor) {
    console.log("PASS: H2 inherited color but NOT background-color.");
  } else {
    console.error("FAIL: Inheritance logic is wrong!");
  }
}

console.log("\n--- CHECKING RANGE SUBTRACTION (Div) ---");
const div = elements.find((e) => e.tagName === "div");
if (div) {
  const ranges = getRangesForElement(div, "char-range");
  console.log(ranges.join("\n"));
  // Verify offsets
  const divStart = document.offsetAt(div.startPosition);
  const firstP = div.children[0];
  const pStart = document.offsetAt(firstP.startPosition);

  // Check if div starts before p
  if (divStart < pStart) {
    console.log(`PASS: Div starts at ${divStart}, Child P starts at ${pStart}`);
  } else {
    console.error(`FAIL: Div start ${divStart} is not before P start ${pStart}`);
  }
}
