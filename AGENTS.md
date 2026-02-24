# Color Flow - API Documentation

This document provides detailed documentation for main functions and modules in Color Flow extension.

## Table of Contents

- [ColorConverter Module](#colorconverter-module)
- [StyleParser Module](#styleparser-module)
- [CSSParser Module](#cssparser-module)
- [HTMLParser Module](#htmlparser-module)
- [ReactParser Module](#reactparser-module)
- [SettingsManager Module](#settingsmanager-module)
- [DecorationManager Module](#decorationmanager-module)
- [Extension Entry Point](#extension-entry-point)

---

## ColorConverter Module

### `convertToRGBA(colorString: string, opacity: number): string | null`

Converts a color string to RGBA format with applied opacity.

**Parameters:**

- `colorString` (string): The color value to convert (e.g., "red", "#ff0000", "rgb(255,0,0)")
- `opacity` (number): Opacity value between 0 and 1 to apply to the color

**Returns:**

- `string | null`: RGBA color string in format "rgba(r,g,b,a)" or null if invalid

**Example:**

```typescript
convertToRGBA("#ff0000", 0.5); // Returns: "rgba(255, 0, 0, 0.5)"
convertToRGBA("blue", 0.3); // Returns: "rgba(0, 0, 255, 0.3)"
```

**Dependencies:** tinycolor2

---

### `isValidColor(colorString: string): boolean`

Validates whether a string represents a valid color.

**Parameters:**

- `colorString` (string): The color string to validate

**Returns:**

- `boolean`: True if color is valid, false otherwise

**Example:**

```typescript
isValidColor("#ff0000"); // Returns: true
isValidColor("notacolor"); // Returns: false
```

**Dependencies:** tinycolor2

---

### `parseColor(colorString: string): RGBAColor | null`

Parses a color string into an RGBA object.

**Parameters:**

- `colorString` (string): The color string to parse

**Returns:**

- `RGBAColor | null`: Object with r, g, b, a properties or null if invalid

**Example:**

```typescript
parseColor("#ff0000"); // Returns: { r: 255, g: 0, b: 0, a: 1 }
parseColor("blue"); // Returns: { r: 0, g: 0, b: 255, a: 1 }
```

**Dependencies:** tinycolor2

---

## StyleParser Module

### `parseStyleString(styleString: string): ParsedStyles`

Parses a CSS style string into a key-value object.

**Parameters:**

- `styleString` (string): CSS style declarations string (e.g., "color: red; background: blue;")

**Returns:**

- `ParsedStyles`: Object mapping property names to their values

**Example:**

```typescript
parseStyleString("color: red; background-color: blue;");
// Returns: { color: "red", "background-color": "blue" }
```

---

### `extractColorProperties(styles: ParsedStyles): { color?: string; backgroundColor?: string }`

Extracts color-related properties from a parsed styles object.

**Parameters:**

- `styles` (ParsedStyles): Object containing parsed CSS properties

**Returns:**

- Object with optional `color` and `backgroundColor` properties

**Example:**

```typescript
extractColorProperties({ color: "red", fontSize: "16px" });
// Returns: { color: "red" }
```

---

### `isColorProperty(property: string): boolean`

Checks if a property name is a color-related CSS property.

**Parameters:**

- `property` (string): CSS property name to check

**Returns:**

- `boolean`: True if property is color-related

**Example:**

```typescript
isColorProperty("color"); // Returns: true
isColorProperty("fontSize"); // Returns: false
```

---

### `getStyleProperties(styleString: string): StyleProperty[]`

Converts a style string into an array of StyleProperty objects.

**Parameters:**

- `styleString` (string): CSS style declarations string

**Returns:**

- `StyleProperty[]`: Array of objects with property and value fields

**Example:**

```typescript
getStyleProperties("color: red; background: blue;");
// Returns: [{ property: "color", value: "red" }, { property: "background", value: "blue" }]
```

---

### `resolveCSSVariable(value: string, cssVariables: Map<string, CSSVariableDefinition>): string`

Resolves CSS custom property references (`var(--name)`) to their actual values.

**Parameters:**

- `value` (string): CSS property value that may contain CSS variable references
- `cssVariables` (Map<string, CSSVariableDefinition>): Map of CSS variable definitions

**Returns:**

- `string`: Resolved value with CSS variables replaced by their actual values

**Behavior:**

- Parses `var(--variable-name)` syntax
- Supports fallback values: `var(--missing, fallback-color)`
- Handles nested variables (variables that reference other variables)
- Prevents infinite loops (max 10 iterations)
- Works with multiple variables in a single value

**Example:**

```typescript
const variables = new Map([
  ["primary", { name: "primary", value: "#ff0000" }],
  ["secondary", { name: "secondary", value: "#00ff00" }],
]);

resolveCSSVariable("var(--primary)", variables); // Returns: "#ff0000"
resolveCSSVariable("var(--missing, #000)", variables); // Returns: "#000"
resolveCSSVariable("border: 1px solid var(--primary)", variables); // Returns: "border: 1px solid #ff0000"
```

---

## CSSParser Module

### `parseCSSStyles(cssText: string): Map<string, ClassColorDefinition>`

Parses CSS text and extracts color definitions for CSS classes.

**Parameters:**

- `cssText` (string): CSS text content (typically from `<style>` tags)

**Returns:**

- `Map<string, ClassColorDefinition>`: Map of class names to their color definitions

**Behavior:**

- Extracts CSS rules using regex pattern matching
- Parses selectors to find class names (`.className`)
- Extracts `color` and `background-color` declarations
- Merges multiple rules for the same class (first color found is used)

**Example:**

```typescript
const css = ".text-red { color: red; } .bg-blue { background-color: blue; }";
const classColors = parseCSSStyles(css);
console.log(classColors.get("text-red")); // { className: "text-red", color: "red" }
```

---

### `extractClassNames(selector: string): string[]`

Extracts class names from a CSS selector.

**Parameters:**

- `selector` (string): CSS selector string (e.g., ".btn.active, .link:hover")

**Returns:**

- `string[]`: Array of class names without the dot prefix

**Example:**

```typescript
extractClassNames(".btn.active, .link:hover");
// Returns: ["btn", "active", "link", "hover"]
```

---

### `extractCSSRules(cssText: string): CSSRule[]`

Extracts CSS rules from CSS text.

**Parameters:**

- `cssText` (string): CSS text content

**Returns:**

- `CSSRule[]`: Array of CSS rules with selectors and declarations

**Implementation:**

- Removes CSS comments before parsing
- Uses regex `/{[^}]}/` to match rule blocks
- Splits declarations by semicolon

---

### `removeComments(cssText: string): string`

Removes CSS comments from text.

**Parameters:**

- `cssText` (string): CSS text content

**Returns:**

- `string`: CSS text without comments

**Implementation:**

- Uses regex `/\/\*[\s\S]*?\*\//g` to match multi-line comments

---

### `parseCSSVariables(cssText: string): Map<string, CSSVariableDefinition>`

Parses CSS text and extracts CSS custom properties (variables).

**Parameters:**

- `cssText` (string): CSS text content (from `<style>` tags or external CSS files)

**Returns:**

- `Map<string, CSSVariableDefinition>`: Map of variable names to their definitions

**Behavior:**

- Extracts CSS rules using regex pattern matching
- Finds all properties starting with `--` (custom properties)
- Stores both property name and value for later resolution

**Example:**

```typescript
const css = ":root { --primary-color: #ff0000; --secondary-color: #00ff00; }";
const variables = parseCSSVariables(css);
console.log(variables.get("primary-color")); // { name: "primary-color", value: "#ff0000" }
console.log(variables.get("secondary-color")); // { name: "secondary-color", value: "#00ff00" }
```

---

## HTMLParser Module

### `parseHTMLDocument(document: vscode.TextDocument): ParseResult`

Parses an HTML document and extracts elements with inline styles.

**Parameters:**

- `document` (vscode.TextDocument): VS Code text document to parse

**Returns:**

- `ParseResult`: Object containing:
  - `elements`: Array of all parsed HTMLElement objects
  - `root`: Root element of the HTML tree

**Implementation Details:**

- Uses `document.positionAt()` for accurate character-based positioning
- Captures `startIndex` and `endIndex` from htmlparser2 for precise range calculation
- Handles multiline text content correctly
- Supports HTML, PHP, Vue, Svelte, Astro, TSX, JSX, Razor, Handlebars, and EJS files

**Example:**

```typescript
const result = parseHTMLDocument(editor.document);
console.log(result.elements); // Array of elements with color info
```

**Dependencies:** htmlparser2

---

### `findElementsByColor(elements: HTMLElement[], colorType: 'color' | 'backgroundColor'): HTMLElement[]`

Filters elements that have a specific color type defined.

**Parameters:**

- `elements` (HTMLElement[]): Array of parsed HTML elements
- `colorType` ('color' | 'backgroundColor'): Type of color to filter by

**Returns:**

- `HTMLElement[]`: Array of elements with specified color type

**Example:**

```typescript
const coloredElements = findElementsByColor(elements, "color");
```

---

### `getElementTextRange(element: HTMLElement): vscode.Range | null`

Gets the text range for an element's content.

**Parameters:**

- `element` (HTMLElement): Parsed HTML element

**Returns:**

- `vscode.Range | null`: Range of element's text content or null

**Example:**

```typescript
const range = getElementTextRange(element);
```

---

### `getElementFullRange(element: HTMLElement): vscode.Range`

Gets the full range from element start to end position.

**Parameters:**

- `element` (HTMLElement): Parsed HTML element

**Returns:**

- `vscode.Range`: Range from element start to end

**Example:**

```typescript
const range = getElementFullRange(element);
```

---

## ReactParser Module

### `parseReactDocument(document: vscode.TextDocument): ParseResult`

Parses a React/TSX/JSX document and extracts elements with inline styles and JSX expressions.

**Parameters:**

- `document` (vscode.TextDocument): VS Code text document to parse

**Returns:**

- `ParseResult`: Object containing:
  - `elements`: Array of all parsed HTMLElement objects
  - `root`: Root element of the React component tree

**Implementation Details:**

- **JSX Sanitization**: Masks complex JavaScript expressions (`{...}`) to prevent htmlparser2 from breaking on special characters
- **Expression Handling**: Simple expressions (like `{title}`, `{children}`) are masked with underscores to allow highlighting
- **Complex Logic Detection**: Identifies and masks complex expressions (arrow functions, conditionals, etc.) to avoid incorrect highlighting
- **Style Object Parsing**: Extracts colors from React-style inline `style={{ ... }}` objects
- **Nested Element Support**: Correctly handles nested elements and React fragments

**Example:**

```typescript
const result = parseReactDocument(editor.document);
console.log(result.elements); // Array of React elements with color info
```

**Dependencies:** htmlparser2

---

### `parseReactStyleObject(styleString: string): { [key: string]: string }`

Parses a React style object string and extracts color properties.

**Parameters:**

- `styleString` (string): The style object body (e.g., `"color: 'red', fontSize: '16px'"`)

**Returns:**

- `{ [key: string]: string }`: Object with style properties and extracted color values

**Example:**

```typescript
const styles = parseReactStyleObject("color: 'red', backgroundColor: 'blue'");
console.log(styles); // { color: 'red', backgroundColor: 'blue' }
```

---

### `sanitizeJSX(text: string): string`

Sanitizes JSX/TSX text by masking logic blocks while preserving tags.

**Parameters:**

- `text` (string): Raw JSX/TSX text

**Returns:**

- `string`: Sanitized text with complex logic masked

**Purpose:**

- Prevents htmlparser2 from breaking on characters like `>` inside JavaScript expressions
- Prevents decoration manager from highlighting complex code blocks
- Preserves simple JSX expressions for proper highlighting

**Example:**

```typescript
const sanitized = sanitizeJSX("<div>{title}</div>");
console.log(sanitized); // '<div>{_____}</div>' (title becomes underscores)
```

---

## SettingsManager Module

### `constructor()`

Creates a new SettingsManager instance and loads initial configuration.

**Example:**

```typescript
const settingsManager = new SettingsManager();
```

---

### `getSettings(): ColorFlowSettings`

Returns a copy of current extension settings.

**Returns:**

- `ColorFlowSettings`: Object containing all configuration values

**Example:**

```typescript
const settings = settingsManager.getSettings();
console.log(settings.opacity); // e.g., 0.2
console.log(settings.enabled); // e.g., true
```

---

### `onSettingsChanged: vscode.Event<ColorFlowSettings>`

Event that fires when settings change.

**Example:**

```typescript
settingsManager.onSettingsChanged((settings) => {
  console.log("Settings updated:", settings);
});
```

---

### `toggleEnabled(): void`

Toggles the extension enabled state.

**Example:**

```typescript
settingsManager.toggleEnabled();
```

---

### `setEnabled(enabled: boolean): void`

Sets the extension enabled state.

**Parameters:**

- `enabled` (boolean): New enabled state

**Example:**

```typescript
settingsManager.setEnabled(false);
```

---

### `dispose(): void`

Cleans up resources and event listeners.

**Example:**

```typescript
settingsManager.dispose();
```

---

## DecorationManager Module

### `constructor()`

Creates a new DecorationManager instance.

**Example:**

```typescript
const decorationManager = new DecorationManager();
```

---

### `applyDecorations(editor: vscode.TextEditor, elements: HTMLElement[], settings: ColorFlowSettings, classColorMap?: Map<string, ClassColorDefinition>): void`

Applies color decorations to elements in the editor.

**Parameters:**

- `editor` (vscode.TextEditor): VS Code text editor to decorate
- `elements` (HTMLElement[]): Array of parsed HTML elements
- `settings` (ColorFlowSettings): Current extension settings
- `classColorMap` (Map<string, ClassColorDefinition>, optional): Map of CSS class color definitions

**Behavior:**

- Checks `settings.enabled` - if false, clears all decorations and returns
- Processes elements with inline styles containing color or background-color properties
- When `settings.enableClassHighlighting` is true and `classColorMap` is provided:
  - Falls back to class-based colors for elements without inline colors
  - Searches element's `classes` array for matching color definitions
- Groups decorations by color for efficient rendering
- Caches decoration types to avoid recreation

**Example:**

```typescript
decorationManager.applyDecorations(editor, elements, settings, classColorMap);
```

---

### `getRangesForElement(document: vscode.TextDocument, element: HTMLElement, mode: HighlightMode): vscode.Range[]`

Determines the ranges to highlight based on the selected highlight mode.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `element` (HTMLElement): Parsed HTML element
- `mode` (HighlightMode): The highlight mode to use

**Returns:**

- `vscode.Range[]`: Array of ranges to decorate

**Highlight Modes:**

- **full-line**: Returns ranges for each complete line the element spans (column 0 to end of line)
- **word-only**: Returns separate ranges for each word, skipping whitespace between them
- **char-range**: Returns a single range for the element's text content with whitespace trimmed

**Example:**

```typescript
const ranges = decorationManager.getRangesForElement(document, element, "word-only");
```

---

### `getWordRanges(document: vscode.TextDocument, range: vscode.Range, text: string): vscode.Range[]`

Extracts individual word ranges from a text range.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `range` (vscode.Range): The range to search within
- `text` (string): The text content to parse

**Returns:**

- `vscode.Range[]`: Array of ranges for each word

**Implementation:**

- Uses regex `/\S+/g` to find non-whitespace sequences
- Calculates precise character offsets using `document.offsetAt()` and `document.positionAt()`

---

### `trimWhitespaceRange(document: vscode.TextDocument, range: vscode.Range, text: string): vscode.Range`

Trims leading and trailing whitespace from a range.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `range` (vscode.Range): The range to trim
- `text` (string): The text content

**Returns:**

- `vscode.Range`: Trimmed range

**Implementation:**

- Handles multiline text correctly using character offsets
- Returns original range if trimming would result in invalid range

---

### `clearDecorations(editor: vscode.TextEditor): void`

Removes all decorations from the editor.

**Parameters:**

- `editor` (vscode.TextEditor): VS Code text editor

**Example:**

```typescript
decorationManager.clearDecorations(editor);
```

---

### `clearCache(): void`

Clears the decoration cache and disposes of all decoration types.

**Example:**

```typescript
decorationManager.clearCache();
```

---

### `dispose(): void`

Cleans up all resources and decorations.

**Example:**

```typescript
decorationManager.dispose();
```

---

## Extension Entry Point

### `activate(context: vscode.ExtensionContext): void`

Main activation function called when the extension is loaded.

**Parameters:**

- `context` (vscode.ExtensionContext): Extension context for managing subscriptions

**Behavior:**

- Initializes settings and decoration managers
- Creates and configures status bar item with enabled/disabled state indicator
- Registers event listeners for document changes and active editor changes
- Registers commands (openSettings, toggle, refresh)
- Applies decorations to the active editor on startup
- Updates status bar when settings change

**Supported Languages:**

- HTML
- PHP
- Vue
- Svelte
- Astro
- TypeScript React (typescriptreact)
- JavaScript React (javascriptreact)
- Razor
- Handlebars
- EJS

**Example:**

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Extension initialization code
}
```

---

### `extractCSSFromDocument(document: vscode.TextDocument): string`

Extracts CSS content from both inline `<style>` tags and linked external CSS files.

**Parameters:**

- `document` (vscode.TextDocument): VS Code text document to parse

**Returns:**

- `string`: Combined CSS content from all sources

**Behavior:**

- Extracts CSS from `<style>` tags using regex pattern matching
- Finds all `<link rel="stylesheet">` tags and extracts href attributes
- Reads external CSS files from the filesystem using Node.js `fs` module
- Combines all CSS content for variable and class resolution
- Handles errors gracefully if external CSS files cannot be read

**Example:**

```typescript
const cssContent = extractCSSFromDocument(editor.document);
// Returns CSS from both <style> tags and linked CSS files
```

**Note:** This function enables CSS variables and class-based colors defined in external stylesheets to work with Color Flow highlighting.

---

### `deactivate(): void`

Cleanup function called when the extension is deactivated.

**Behavior:**

- Clears pending update timeouts
- Disposes of settings and decoration managers

**Example:**

```typescript
export function deactivate() {
  // Cleanup code
}
```

---

## Type Definitions

### `RGBAColor`

```typescript
interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

### `ParsedStyles`

```typescript
interface ParsedStyles {
  [property: string]: string;
}
```

### `StyleProperty`

```typescript
interface StyleProperty {
  property: string;
  value: string;
}
```

### `HTMLElement`

```typescript
interface HTMLElement {
  tagName: string;
  attributes: { [name: string]: string };
  styles: ParsedStyles;
  colors: {
    color?: string;
    backgroundColor?: string;
  };
  startPosition: vscode.Position;
  endPosition: vscode.Position;
  textStartPosition?: vscode.Position;
  textEndPosition?: vscode.Position;
  textContent?: string;
  parent?: HTMLElement;
  children: HTMLElement[];
  hasInlineStyle: boolean;
}
```

### `ColorFlowSettings`

```typescript
interface ColorFlowSettings {
  enabled: boolean;
  opacity: number;
  enableBorder: boolean;
  borderColor: string;
  borderSize: string;
  borderRadius: string;
  highlightMode: "full-line" | "word-only" | "char-range";
  enableClassHighlighting: boolean;
  hideBackgroundHighlight: boolean;
}
```

### `HighlightMode`

```typescript
type HighlightMode = "full-line" | "word-only" | "char-range";
```

### `ClassColorDefinition`

```typescript
interface ClassColorDefinition {
  className: string;
  color?: string;
  backgroundColor?: string;
}
```

### `CSSRule`

```typescript
interface CSSRule {
  selector: string;
  declarations: CSSDeclaration[];
}
```

### `CSSDeclaration`

```typescript
interface CSSDeclaration {
  property: string;
  value: string;
}
```

---

## Architecture Overview

Color Flow is built with a modular architecture:

1. **ColorConverter**: Handles color parsing and conversion to RGBA format
2. **StyleParser**: Parses CSS style strings and extracts color properties
3. **CSSParser**: Parses CSS rules from `<style>` tags and extracts class-based color definitions
4. **HTMLParser**: Parses HTML documents using htmlparser2 and tracks accurate positions
5. **SettingsManager**: Manages extension configuration and change events
6. **DecorationManager**: Applies VS Code text decorations based on parsed elements and settings
7. **Extension Entry Point**: Coordinates all components and manages VS Code lifecycle

### Key Design Decisions

- **Character-based Positioning**: Uses `document.positionAt()` instead of manual line/column counting for accuracy
- **Decoration Caching**: Reuses `vscode.TextEditorDecorationType` objects for performance
- **Debounced Updates**: Uses 100ms timeout to avoid excessive decorations during typing
- **Class Color Map**: Uses `Map<string, ClassColorDefinition>` for O(1) class color lookups
- **Supported Languages Filter**: Checks `languageId` before processing to avoid unsupported file types
- **Status Bar Integration**: Provides visual feedback and quick access to settings
- **Conditional Class Highlighting**: Only parses CSS when `enableClassHighlighting` setting is true
