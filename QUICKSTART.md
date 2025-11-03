# Quick Start Guide

## Load the Extension (5 minutes)

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar
3. Press Enter

### Step 2: Enable Developer Mode
1. Look for the "Developer mode" toggle in the top-right corner
2. Turn it ON (it should be blue/enabled)

### Step 3: Load the Extension
1. Click the "Load unpacked" button (top-left area)
2. Navigate to this folder:
   ```
   /Users/riteshkanjee/Documents/dev/medium_article_chrome_extension
   ```
3. Click "Select"

### Step 4: Verify Installation
- The extension should appear in your list
- Look for "Medium to LinkedIn Article Publisher"
- No need to pin the icon - we have an on-page button!

## First Test Run (2 minutes)

### Test 1: See the Floating Button
1. Go to any Medium article, for example:
   - https://medium.com/@yourfavoriteblog/any-article
   - Or your own Medium draft: https://medium.com/p/2b99d4f37373/edit

2. Look for the purple "Post to LinkedIn" button in the top-right corner
   - It should be floating over the page
   - Purple gradient background
   - LinkedIn icon visible

### Test 2: Extract Article
1. Click the "Post to LinkedIn" button

2. A panel slides in from the right side

3. Click "Extract Article"

4. Watch the preview appear:
   - Article title
   - Statistics (word count, images, blocks)
   - First paragraph preview

### Test 3: Post to LinkedIn
1. After successful extraction, click "Post to LinkedIn" in the panel

2. Watch as:
   - A new tab opens to LinkedIn article editor
   - Content is automatically injected
   - Images appear (may take a moment)

3. Review the article on LinkedIn:
   - Check title
   - Check content formatting
   - Verify images loaded

4. Make any final edits if needed

5. Publish on LinkedIn when ready!

## UI Overview

### Floating Button (Top Right)
- Always visible on Medium pages
- Click to open the panel
- Hover for nice animation effect

### Slide-In Panel (Right Side)
- Shows status messages
- Displays article preview
- Contains Extract and Post buttons
- Close with X or by finishing the workflow

## Troubleshooting

### Extension Won't Load
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check for any red error messages on chrome://extensions/
- Try reloading the extension (click the refresh icon)

### Button Not Showing on Medium
- Make sure you're on an actual Medium article page
- Refresh the page (Cmd+R or Ctrl+R)
- Check the browser console for errors (F12 → Console tab)
- Verify extension is enabled on chrome://extensions/

### Panel Won't Open
- Check browser console (F12) for JavaScript errors
- Try reloading the extension
- Refresh the Medium page

### "Extract Article" Does Nothing
- Check the browser console for errors
- Make sure you're on an actual Medium article page
- Try refreshing and waiting for full page load

### Images Not Showing on LinkedIn
- Wait a few seconds - the extension retries automatically
- Check your internet connection
- Very large images may take longer to process

### Content Looks Wrong
- Some Medium formatting is simplified for LinkedIn compatibility
- You can edit directly in LinkedIn's editor
- Report issues for future improvements

## Tips for Success

- **Look for the Button**: The purple floating button appears on any Medium article page
- **Wait for Extraction**: Let the extraction complete before posting
- **Review Preview**: Always check the preview in the panel
- **Keep Extension Updated**: Pull latest changes for improvements

## Alternative Method

You can still use the extension icon in the Chrome toolbar if you prefer:
1. Click the extension icon
2. Use the popup interface
3. Same functionality, different approach

The floating button is just more convenient! 🎯

## Next Steps

- Read the [full usage guide](docs/usage.md) for detailed instructions
- Check out [manual test checklist](tests/manual-test-checklist.md) for thorough testing
- Review [architecture docs](docs/architecture.md) if you want to understand how it works

## Getting Help

1. Check browser console (F12) for error messages
2. Review documentation in `/docs` folder
3. Verify you're using the latest Chrome version
4. Make sure you're logged into both Medium and LinkedIn

---

**Ready to streamline your publishing workflow? Look for the purple button! 🚀**
