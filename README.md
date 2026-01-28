# Color Flow

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/DotJumpDot/Color-Flow)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue.svg)](https://code.visualstudio.com/)

Visualize inline CSS colors in HTML documents with configurable background highlighting.

## Features

- Color Flow automatically detects and highlights inline CSS colors in your HTML documents
- Supports multiple color formats: named colors, hex, rgb/rgba, hsl/hsla
- Configurable highlighting modes: full-line, word-only, or character-range
- Customizable opacity, borders, and border radius
- Real-time updates as you type
- Toggle extension on/off with a single command

## Supported Languages

- HTML
- PHP
- Vue
- Svelte

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Color Flow"
4. Click Install

### From VSIX

1. Download the latest `.vsix` file from the [Releases](https://github.com/DotJumpDot/Color-Flow/releases) page
2. In VS Code, go to Extensions > ... (three dots) > Install from VSIX
3. Select the downloaded file

## Usage

Once installed, Color Flow automatically highlights colors in HTML documents with inline styles:

```html
<div style="color: blue">
  <p style="color: red">This text will have a red background</p>
</div>
```

The extension will apply a semi-transparent background color to match the specified color value.

### Commands

| Command | Description |
|----------|-------------|
| `Color Flow: Open Settings` | Open the extension settings page |
| `Color Flow: Toggle Highlighting` | Toggle color highlighting on/off |
| `Color Flow: Refresh Decorations` | Manually refresh color decorations |

## Configuration

Color Flow provides several configuration options to customize your experience:

### Opacity

Controls the transparency of the background color highlight.

- **Type:** Number (0-1)
- **Default:** 0.2
- **Example:** 0.5 for more visible highlights

```json
{
  "colorFlow.opacity": 0.3
}
```

### Enable Border

Adds a border around highlighted text.

- **Type:** Boolean
- **Default:** false

```json
{
  "colorFlow.enableBorder": true
}
```

### Border Color

Sets the color of the border (when enabled).

- **Type:** String
- **Default:** "currentColor"
- **Example:** "#000000", "red", "rgba(0,0,0,0.5)"

```json
{
  "colorFlow.borderColor": "#000000"
}
```

### Border Radius

Controls the roundness of border corners.

- **Type:** String
- **Default:** "0px"
- **Example:** "4px", "8px", "50%"

```json
{
  "colorFlow.borderRadius": "4px"
}
```

### Highlight Mode

Determines how much of the text to highlight.

- **Type:** Enum
- **Options:**
  - `full-line`: Highlight the entire line
  - `word-only`: Highlight from first non-space to last non-space character
  - `char-range`: Highlight the exact element text range (default)
- **Default:** `char-range`

```json
{
  "colorFlow.highlightMode": "word-only"
}
```

## Supported Color Formats

Color Flow recognizes the following color formats:

- **Named colors:** `red`, `blue`, `green`, etc.
- **Hex colors:** `#f00`, `#ff0000`, `#ff0000ff`
- **RGB/RGBA:** `rgb(255,0,0)`, `rgba(255,0,0,0.5)`
- **HSL/HSLA:** `hsl(0,100%,50%)`, `hsla(0,100%,50%,0.5)`

## How It Works

Color Flow parses HTML documents and:

1. Identifies elements with inline `style` attributes
2. Extracts color-related properties (`color`, `background-color`, `backgroundColor`)
3. Converts color values to RGBA format with configured opacity
4. Applies background decorations to matching text ranges
5. Updates decorations in real-time as you edit

## Limitations

Color Flow currently supports:
- Inline styles only (`style="..."` attributes)
- Direct color values (no CSS variables or class-based styles)

Not supported:
- CSS class definitions (`.class { color: red; }`)
- CSS variables (`var(--my-color)`)
- External CSS files
- `<style>` block declarations
- Color inheritance from parent elements

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Run tests: `npm test`
5. Press F5 in VS Code to launch extension in debug mode

## License

MIT License - see [LICENSE](LICENSE) file for details

Copyright (c) 2026 DotJumpDot

## Credits

Built with:
- [htmlparser2](https://github.com/fb55/htmlparser2) - Fast and forgiving HTML/XML parser
- [tinycolor2](https://github.com/bgrins/TinyColor) - Color manipulation and conversion

## Support

- Report issues: [GitHub Issues](https://github.com/DotJumpDot/Color-Flow/issues)
- Documentation: [AGENTS.md](AGENTS.md) - API documentation for developers
