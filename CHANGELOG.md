# Changelog

All notable changes to Color Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.5.0] - 2026-02-23

### Added

- **Astro File Support**: Full support for `.astro` files with component syntax
- **Blazor Support**: Added support for Razor files (`.razor`) for Microsoft's web framework
- **Handlebars Support**: Full support for `.hbs` files with template syntax
- **EJS Support**: Added support for `.ejs` (Embedded JavaScript templates)
- **Template Engine Compatibility**: Enhanced parser to work with various template languages and frameworks
- **CSS Variables Support**: Parse and resolve CSS custom properties (variables) like `var(--my-color)`
  - Extracts CSS variables from `:root` and style definitions
  - Resolves `var(--variable-name)` references in inline styles and class-based colors
  - Supports fallback values: `var(--variable, fallback-color)`
  - Handles variable references in both color and background-color properties
- **External CSS Files Support**: Parse and resolve CSS from linked `<link rel="stylesheet">` files
  - Reads external CSS files from the filesystem
  - Combines external CSS with inline `<style>` tags for variable resolution
  - Enables CSS variables defined in external stylesheets to work with color highlighting

## [1.4.5] - 2026-02-23

### Fixed

- **JSX Expression Highlighting**: Fixed issue where JSX expressions like `{title}`, `{children}`, and `{config.label}` were not being highlighted. These expressions now correctly display color backgrounds based on parent element styles
- **Code Syntax Detection**: Improved `isPureCodeSyntax` method to properly distinguish between:
  - React variable expressions (should be highlighted): `{variable}`, `{props.name}`, `{item.description}`
  - Pure code syntax (should not be highlighted): function declarations, const/let statements, control flow
- **Sanitized Expression Handling**: Added support for sanitized underscore representations of JSX expressions (e.g., `{_____}`) used internally by the parser

### Added

- **React Parser Tests**: Comprehensive unit tests for JSX/TSX parsing covering:
  - Inline styles with color and backgroundColor
  - Class name parsing
  - Nested elements
  - JSX expressions and text content
  - Conditional styles
  - Self-closing tags
  - React fragments
  - Various HTML elements (div, button, span, h1, p, img)
- **Decoration Manager Tests**: Unit tests for code syntax detection including JSX expressions and sanitized text handling

### Changed

- **VSIX Package Optimization**: Excluded `example/`, `.trae/`, and `IDEA.md` from extension package for smaller, cleaner distribution

## [1.4.4] - 2026-02-11

### Fixed

- **TSX/JSX Parsing Bug**: Fixed issue where arrow functions and complex JavaScript expressions in JSX attributes (e.g., `onClick={() => ...}`) caused incorrect highlighting of entire code blocks
- **Conditional Style Parsing**: Improved React style object parsing to correctly handle conditional styles and ternary operators (e.g., `backgroundColor: visible ? "#564E4E" : "#9c8c8c"`)
- **JSX Attribute Sanitization**: Added robust sanitization of JSX attribute values to prevent htmlparser2 from misinterpreting special characters like `>` inside JavaScript expressions
- **Accurate Text Ranges**: Fixed element text content detection in React files to ensure highlights only appear on actual text content, not on surrounding JSX syntax

## [1.4.3] - 2026-02-06

### Added

- **TSX and JSX Support**: Full support for `.tsx` and `.jsx` files, including intelligent parsing for React-style inline styles (`style={{ color: 'red' }}`).

## [1.4.2] - 2026-02-06

### Added

- **Svelte and Vue Support**: Enhanced support for Svelte and Vue components, ensuring color highlighting and CSS class detection work seamlessly across these frameworks.

## [1.4.1] - 2026-02-05

### Added

- **Second Demo GIF**: Added demo2.gif showcasing CSS class highlighting and nested element color inheritance
- **Enhanced Documentation**: README now includes two demo sections - one for inline styles and one for CSS classes

## [1.4.0] - 2026-02-05

### Added

- **Proper Color Inheritance**: Nested elements now correctly inherit colors from parent elements using CSS inheritance rules
- **Last Color Priority**: Elements use the most specific (closest ancestor) color definition, following proper CSS specificity
- **Recursive Color Resolution**: New `getEffectiveColor` method in DecorationManager for intelligent color lookup through the element tree

### Fixed

- **Nested Element Highlighting**: Fixed issue where nested elements (like `<p>` inside `<div>` with CSS classes) were not being highlighted
- **Sub Div Content Color**: Sub divs and nested elements now properly inherit and display colors from parent elements
- **Parent-Child Color Chain**: Color inheritance now correctly propagates through multiple levels of nesting

## [1.3.0] - 2026-02-04

### Added

- **CSS Class Highlighting**: New feature to highlight colors defined in CSS classes within `<style>` tags
- **Class Color Map**: Parses CSS rules from style blocks to extract class-based color definitions
- **Class Attribute Tracking**: HTML parser now tracks class attributes on elements for class-based highlighting
- **CSS Parser Module**: New `cssParser.ts` module for parsing and extracting class color definitions from CSS

### Changed

- **Class Highlighting Default**: `enableClassHighlighting` setting now defaults to `true` for better out-of-the-box experience
- **Performance Optimization**: Class highlighting uses efficient Map-based lookups for O(1) color retrieval

## [1.2.5] - 2026-01-28

### Changed

- **Publisher Update**: Changed publisher ID from `StringExtractor` to `DotJumpDot` to align with GitHub repository and marketplace consistency

## [1.2.4] - 2026-01-28

### Changed

- **README Structure**: Reorganized README.md to place the Demo section above Features for better visual hierarchy and immediate visual preview of extension capabilities

## [1.2.3] - 2026-01-28

### Changed

- **Documentation Overhaul**: Completely redesigned README.md with professional formatting, including:
  - Enhanced visual styling with emojis and centered header
  - Improved badge section with VS Marketplace-specific metrics
  - Better structure with dedicated sections for extension info, configuration, and technical details
  - Added Mermaid flowchart for "How It Works" section
  - New performance section highlighting extension optimizations
  - Comprehensive roadmap with planned features
  - Professional footer with support resources and back-to-top navigation

## [1.2.2] - 2026-01-28

### Added

- **New Assets**: Added new extension icon and demo animation to better showcase extension features

## [1.2.1] - 2026-01-28

### Fixed

- **Whitespace Highlighting**: Fixed issue in `char-range` mode where whitespace between tags (like newlines and indentation) was being highlighted
- **Empty Text Node Handling**: Improved `trimWhitespaceRange` to correctly return empty ranges for nodes containing only whitespace

## [1.2.0] - 2026-01-28

### Changed

- **Simplified Char-Range Mode**: Re-implemented `char-range` mode to only highlight trimmed text content for all elements, removing tag highlighting for elements with inline styles
- **Background Color Inheritance**: Updated parser to allow children to inherit `background-color` from parent elements, ensuring consistent highlighting across nested elements

### Fixed

- **Nested Element Inheritance**: Fixed behavior where nested elements without their own styles would not show parent background colors in certain highlight modes

## [1.1.0] - 2026-01-28

### Added

- **Color Inheritance Support**: Elements now correctly inherit `color` properties from parent elements following CSS rules
- **Inherited Text Highlighting**: Elements without inline styles now have their text content highlighted with inherited colors

### Fixed

- **Word-Only Mode Missing Highlights**: Fixed issue where inherited text elements (like `<h2>` inside `<section>`) were not being highlighted in word-only mode
- **Incorrect Color Inheritance**: Fixed bug where child elements incorrectly inherited `background-color` from parents (background colors are not inherited in CSS)
- **Parent Color Overlapping**: Implemented range subtraction to prevent parent highlight colors from "bleeding" into child element areas
- **Char-Range Mode Alignment**: Fixed offset calculation using `endIndex` for more robust positioning, preventing shifted highlights
- **CRLF Line Ending Support**: Improved offset calculation to handle Windows CRLF (`\r\n`) line endings correctly

### Changed

- **Parser Logic**: Updated `onopentagname` event to calculate start positions from end indices for better accuracy
- **Text Node Tracking**: Elements now track individual text nodes with precise ranges for better highlight control
- **Highlight Priority**: Child element text colors now correctly take precedence over parent background colors

## [1.0.0] - 2026-01-28

### Added

- **TSX/JSX File Support**: Extension now supports `.tsx` and `.jsx` files in addition to HTML, PHP, Vue, and Svelte
- **Enable Highlighting Setting**: New configuration option to enable/disable color highlighting (default: enabled)
- **Status Bar Indicator**: Visual status bar item showing extension state:
  - Shows enabled/disabled state with icon
  - Tooltip displays current status
  - Click to open Color Flow settings
  - Automatically updates when settings change
- **Improved Position Tracking**: HTML parser now uses accurate character-based positioning via VS Code's `positionAt()` API, fixing issues with incorrect highlight positions

### Fixed

- **Char-Range Highlight Mode**: Now correctly highlights the exact text range of element content, trimming leading and trailing whitespace
- **Word-Only Highlight Mode**: Now highlights individual words separately, skipping spaces between words
- **Full-Line Highlight Mode**: Now covers the entire width of each line from column 0 to end of line, including line breaks
- **Position Tracking Accuracy**: Fixed issues where highlights appeared at incorrect positions (e.g., on `<div style` instead of actual text content)
- **Multiline Text Support**: Improved handling of text content that spans multiple lines across highlight modes

### Changed

- **Settings Order**: Configuration properties reordered in settings UI for better organization:
  - "Enable Highlighting" moved to top
  - "Enable Border" placed before "Border Color"
- **HTML Parser**: Refactored to use `document.positionAt()` for accurate character index to position conversion

## [0.1.0] - 2026-01-28

### Added

- Initial release of Color Flow extension
- HTML parsing with inline style detection
- Support for multiple color formats:
  - Named colors (red, blue, green, etc.)
  - Hex colors (#f00, #ff0000, #ff0000ff)
  - RGB/RGBA colors
  - HSL/HSLA colors
- Color conversion to RGBA with configurable opacity
- Three highlight modes:
  - Full-line highlighting
  - Word-only highlighting
  - Character-range highlighting (default)
- Border customization:
  - Enable/disable borders
  - Custom border colors
  - Border radius support
- Real-time decoration updates on document changes
- Toggle extension on/off command
- Refresh decorations command
- Open settings command
- Settings management with change detection
- Decoration caching for performance
- Support for HTML, PHP, Vue, and Svelte files
- Comprehensive test coverage
- API documentation (AGENTS.md)

## [Future Versions]

### Planned Features

- Support for CSS variables (`var(--my-color)`)
- External CSS file parsing
- More color format support (LCH, OKLCH, etc.)
