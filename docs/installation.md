# Installation Guide

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" by toggling the switch in the top-right corner

3. Click "Load unpacked"

4. Navigate to the extension directory and select it:
   ```
   /Users/riteshkanjee/Documents/dev/medium_article_chrome_extension
   ```

5. The extension should now appear in your extensions list with the icon visible in the toolbar

## Verifying Installation

- You should see the extension icon in your Chrome toolbar
- Click the icon to open the popup interface
- The popup should display "Ready" status

## Troubleshooting

### Extension Not Loading

- Check that all files are present in the correct folders
- Verify `manifest.json` is valid JSON
- Check the Chrome extensions page for any error messages

### Content Scripts Not Working

- Ensure you're on a Medium.com or LinkedIn.com page
- Refresh the page after loading the extension
- Check the browser console for any error messages

### Images Not Loading

- Medium images are converted to base64 data URLs
- This may take a few seconds for large images
- Check your internet connection

## Configuring API Key (Optional)

For future Kajabi features with AI metadata generation:

1. Click the extension icon
2. Click "Settings" at the bottom
3. Enter your OpenAI API key
4. Click "Save Settings"

Your API key is stored securely in Chrome sync storage.

