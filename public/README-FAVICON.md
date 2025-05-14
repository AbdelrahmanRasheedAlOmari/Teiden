# Favicon Generation Instructions

The `favicon.svg` file in this directory is the source for all favicon files. The other favicon files (`.ico`, `.png`) are currently placeholders and need to be generated from the SVG.

## How to Generate Favicon Files

1. Visit [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload the `favicon.svg` file
3. Customize the options as needed
4. Download the generated favicon package
5. Replace the placeholder files in this directory with the generated files:
   - `favicon.ico`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`
   - Any other files generated

## Favicon Files

- `favicon.svg`: Vector version of the favicon (source file)
- `favicon.ico`: Standard favicon for browsers
- `apple-touch-icon.png`: Icon for iOS devices
- `android-chrome-192x192.png`: Icon for Android devices
- `android-chrome-512x512.png`: Larger icon for Android devices
- `site.webmanifest`: Web app manifest file with icon information

## Implementation

The favicon files are referenced in:
- `/app/layout.tsx` - Main layout file that includes the favicon links in the head section 