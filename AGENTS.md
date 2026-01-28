# Color Flow - API Documentation

This document provides detailed documentation for the main functions and modules in the Color Flow extension.

## Table of Contents

- [ColorConverter Module](#colorconverter-module)
- [StyleParser Module](#styleparser-module)
- [HTMLParser Module](#htmlparser-module)
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

- `boolean`: True if the color is valid, false otherwise

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

## HTMLParser Module

### `parseHTMLDocument(document: vscode.TextDocument): ParseResult`

Parses an HTML document and extracts elements with inline styles.

**Parameters:**

- `document` (vscode.TextDocument): VS Code text document to parse

**Returns:**

- `ParseResult`: Object containing:
  - `elements`: Array of all parsed HTMLElement objects
  - `root`: Root element of the HTML tree

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

- `HTMLElement[]`: Array of elements with the specified color type

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

### `applyDecorations(editor: vscode.TextEditor, elements: HTMLElement[], settings: ColorFlowSettings): void`

Applies color decorations to elements in the editor.

**Parameters:**

- `editor` (vscode.TextEditor): VS Code text editor to decorate
- `elements` (HTMLElement[]): Array of parsed HTML elements
- `settings` (ColorFlowSettings): Current extension settings

**Example:**

```typescript
decorationManager.applyDecorations(editor, elements, settings);
```

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

Clears the decoration cache and disposes all decoration types.

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
- Registers event listeners for document changes
- Registers commands (openSettings, toggle, refresh)
- Applies decorations to active editor

**Example:**

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Extension initialization code
}
```

---

### `deactivate(): void`

Cleanup function called when the extension is deactivated.

**Behavior:**

- Clears pending timeouts
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
  opacity: number;
  enableBorder: boolean;
  borderColor: string;
  borderRadius: string;
  highlightMode: "full-line" | "word-only" | "char-range";
  enabled: boolean;
}
```

### `HighlightMode`

```typescript
type HighlightMode = "full-line" | "word-only" | "char-range";
```
