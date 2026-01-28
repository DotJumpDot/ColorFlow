# Changelog

All notable changes to Color Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
- Support for class-based styling
- Support for `<style>` block declarations
- Color inheritance from parent elements
- External CSS file parsing
- More color format support (LCH, OKLCH, etc.)
