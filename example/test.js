"use strict";
/*
 * Color Flow Test Instructions
 *
 * This directory contains test files for the Color Flow extension.
 *
 * MAIN TEST FILE: test.html
 *
 * To test the Color Flow extension:
 *
 * 1. Open test.html in VS Code
 * 2. Make sure the Color Flow extension is enabled
 * 3. Verify that inline colors are properly highlighted
 *
 * Test Coverage in test.html:
 *
 * SECTION 1: Basic Color Names
 * - Tests named colors: red, blue, green, orange, purple, teal
 *
 * SECTION 2: Hex Color Values
 * - Tests 6-digit hex colors: #ff0000, #00ff00, #0000ff, etc.
 *
 * SECTION 3: RGB Color Values
 * - Tests rgb() format: rgb(255, 0, 0), rgb(0, 255, 0), etc.
 *
 * SECTION 4: RGBA Color Values
 * - Tests rgba() format with alpha channel
 *
 * SECTION 5: HSL Color Values
 * - Tests hsl() format: hsl(0, 100%, 50%), etc.
 *
 * SECTION 6: Background Color Only
 * - Tests elements with only background-color property
 *
 * SECTION 7: Both Color and Background Color
 * - Tests elements with both color and background-color
 *
 * SECTION 8: Nested Elements with Color Inheritance
 * - Tests color inheritance through nested elements
 *
 * SECTION 9: Nested Elements with Background Color Inheritance
 * - Tests background-color through nested elements
 *
 * SECTION 10: Mixed Color and Background in Nested Structure
 * - Tests complex nesting with color overrides
 *
 * SECTION 11: Long Text Content
 * - Tests highlighting on longer text spans
 *
 * SECTION 12: Multiple Styles Including Color
 * - Tests color combined with other CSS properties
 *
 * SECTION 13: Elements Without Inline Styles
 * - Tests that elements without styles are not highlighted
 *
 * SECTION 14: Short Hex Color Values
 * - Tests 3-digit hex colors: #f00, #0f0, #00f, etc.
 *
 * SECTION 15: Deep Nesting
 * - Tests color inheritance through deeply nested elements
 *
 * SECTION 16: Inline Elements
 * - Tests highlighting on span, strong, em, and a tags
 *
 * SECTION 17: Empty or Minimal Text
 * - Tests highlighting on very short text
 *
 * SECTION 18: Special Characters and Symbols
 * - Tests highlighting on special characters and Unicode
 *
 * SECTION 19: Case Sensitivity
 * - Tests color names with mixed case
 *
 * SECTION 20: Border Radius Testing
 * - Tests background colors for extension border settings
 *
 * Testing Different Highlight Modes:
 *
 * The extension supports three highlight modes (configured in settings):
 *
 * 1. "full-line" - Highlights the entire line containing the element
 * 2. "word-only" - Highlights each word separately
 * 3. "char-range" - Highlights the exact element text range (default)
 *
 * To test each mode:
 * 1. Open VS Code settings (Ctrl+,)
 * 2. Search for "colorFlow.highlightMode"
 * 3. Change the mode and observe the highlighting changes in test.html
 *
 * Testing Extension Settings:
 *
 * - colorFlow.enabled: Toggle extension on/off
 * - colorFlow.opacity: Change opacity of background highlight (0-1)
 * - colorFlow.enableBorder: Enable/disable border around highlights
 * - colorFlow.borderColor: Set border color
 * - colorFlow.borderRadius: Set border radius
 *
 * Expected Behavior:
 *
 * 1. All elements with inline color or background-color should be highlighted
 * 2. Child elements should inherit colors from parent when not overridden
 * 3. Elements without inline styles should NOT be highlighted
 * 4. Highlighting should update in real-time when typing
 * 5. Toggle command should enable/disable highlighting
 * 6. Status bar should show extension state
 */
//# sourceMappingURL=test.js.map