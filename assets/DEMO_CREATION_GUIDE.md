# Demo GIF/Video Creation Guide

This guide will help you create a compelling demo for the Color Flow extension.

## Recommended Tools

### For GIF:
- **OBS Studio** (Free) - Record and export as GIF
- **LICEcap** (Free) - Simple screen-to-GIF recorder
- **GIPHY Capture** (Mac only)
- **ScreenToGif** (Windows) - Best for editing

### For Video:
- **OBS Studio** (Free)
- **Camtasia** (Paid)
- **Loom** (Free/Cloud-based)

## Demo Script

### Scene 1: Installation (5-10 seconds)
- Show VS Code extensions panel
- Search "Color Flow"
- Click Install button

### Scene 2: Basic Usage (10-15 seconds)
- Open an HTML file with inline styles
- Show elements like:
  ```html
  <div style="color: red">Red text</div>
  <p style="color: blue">Blue paragraph</p>
  <span style="background-color: green">Green background</span>
  ```
- Show how the colors appear as backgrounds automatically

### Scene 3: Real-time Updates (8-10 seconds)
- Type `style="color: purple"` in a new element
- Show the purple background appearing as you type
- Delete and recreate to show reactivity

### Scene 4: Configuration (10-15 seconds)
- Open VS Code settings (Ctrl+,)
- Search "colorFlow"
- Show changing opacity from 0.2 to 0.5
- Show enabling border with borderRadius
- Show switching highlight modes (full-line, word-only, char-range)

### Scene 5: Status Bar & Commands (5-8 seconds)
- Click status bar Color Flow icon
- Show settings menu
- Execute "Toggle Highlighting" command
- Show decorations appearing/disappearing

### Scene 6: Multiple File Types (8-10 seconds)
- Show it working in:
  - HTML file
  - Vue component
  - JSX/TSX file
  - PHP file

## Best Practices

### Recording Settings:
- **Resolution:** 1920x1080 or 1280x720
- **Frame rate:** 15-30 fps (for GIF), 30-60 fps (for video)
- **Zoom level:** 125-150% in VS Code for better visibility
- **Font size:** 14-18px for code

### Visual Tips:
- Use a dark VS Code theme (better contrast)
- Choose bright, distinct colors (red, blue, green, purple)
- Keep code simple and readable
- Use short, clear element names
- Minimize UI clutter (hide unnecessary panels)

### GIF Optimization:
- Keep GIF under 15 seconds if possible
- Use minimal color palette (256 colors or less)
- Aim for file size under 5MB
- Trim any dead time or pauses
- Add a 1-2 second pause at end

### Video Optimization:
- Keep total length under 60 seconds
- Add subtle background music (optional)
- Use cursor smoothing
- Add text overlays for key features
- Include voice-over explanation (optional)

## Suggested File Naming

- `demo.gif` - Main animated GIF
- `demo.mp4` - Video version
- `demo.webm` - Alternative video format

## Post-Processing

### GIF Optimization Tools:
- **ezgif.com** - Online GIF compressor
- **GIF Brewery** (Mac)
- **GIFsicle** (Command-line)

### Video Editing Tools:
- **DaVinci Resolve** (Free)
- **HitFilm Express** (Free)
- **CapCut** (Free/Online)

## Example Demo Content

Use this HTML for your demo:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Color Flow Demo</title>
</head>
<body>
  <h1 style="color: #ff6b6b">Color Flow Extension Demo</h1>
  
  <div style="color: #4ecdc4; margin: 20px;">
    <p style="color: #45b7d1">This text has a blue background highlight</p>
    <p style="color: #f9ca24">This text is highlighted in yellow</p>
    <p style="color: #6c5ce7">And this one in purple</p>
  </div>
  
  <section style="background-color: #a29bfe; padding: 20px; color: white;">
    <h2>Background Colors Work Too!</h2>
    <p>Both color and background-color are detected</p>
  </section>
  
  <footer style="color: #636e72; margin-top: 40px;">
    <p>Watch me change in real-time!</p>
  </footer>
</body>
</html>
```

## Testing Your Demo

Before finalizing:
1. Test on different devices
2. Check visibility on light/dark themes
3. Ensure file size is reasonable
4. Verify all features are clearly shown
5. Get feedback from at least one other person

## Upload Instructions

1. Save your final file as `demo.gif` in the `assets/` folder
2. Commit the file: `git add assets/demo.gif && git commit -m "Add demo GIF"`
3. Push to GitHub
4. Update README.md if using different filename

## Alternative: Using GitHub's Gist

If your GIF is too large:
1. Upload to a free image host (Imgur, Giphy)
2. Link to it in README:
   ```markdown
   ![Color Flow Demo](https://i.imgur.com/your-gif.gif)
   ```
