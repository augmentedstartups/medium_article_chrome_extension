# Usage Guide

## Basic Workflow

### Step 1: Navigate to Medium Article

1. Go to any Medium article you want to publish
   - Must be on `medium.com` or `*.medium.com`
   - Can be a published article or draft in edit mode
   - Example: https://medium.com/p/2b99d4f37373/edit

2. Look for the floating "Post to LinkedIn" button in the top-right corner of the page

### Step 2: Extract Article

1. Click the "Post to LinkedIn" button
   - A slide-in panel opens from the right side

2. Click "Extract Article" in the panel

3. Wait for extraction to complete (usually 2-5 seconds)
   - Status shows "Extracting article..."
   - Images are being converted to data URLs

4. Review the preview in the panel:
   - Article title
   - Content statistics (blocks, images, word count)
   - First paragraph preview

### Step 3: Post to LinkedIn

1. After successful extraction, click "Post to LinkedIn" button

2. The extension will:
   - Open a new tab to LinkedIn article editor
   - Wait for the page to load
   - Automatically inject your content
   - Retry up to 3 times if images don't load properly

3. Review the article on LinkedIn:
   - Check that all text is formatted correctly
   - Verify all images are present
   - Make any final edits in LinkedIn's editor

4. Publish your article on LinkedIn

## UI Elements

### Floating Button
- Located in the top-right corner of Medium pages
- Purple gradient background with LinkedIn icon
- Hover for subtle animation
- Always accessible while reading/editing articles

### Slide-In Panel
- Opens from the right side when you click the button
- Shows extraction status
- Displays article preview
- Contains action buttons
- Close with X button or by clicking outside

## Content Support

### Supported Elements

- Headings (H1, H2, H3)
- Paragraphs with inline formatting:
  - Bold text
  - Italic text
  - Links
  - Inline code
- Images with captions
- Bullet lists (unordered)
- Numbered lists (ordered)
- Block quotes
- Code blocks

### Known Limitations

- Complex Medium embeds (tweets, YouTube videos) are not supported
- Medium's custom widgets may not transfer
- Some advanced formatting may be simplified
- Very large images may take time to convert

## Tips for Best Results

1. **Wait for Complete Loading**: Ensure the Medium article is fully loaded before extracting

2. **Check Preview**: Always review the preview in the panel before posting

3. **Edit on LinkedIn**: Make final formatting adjustments in LinkedIn's editor if needed

4. **Image Quality**: Original Medium images are preserved as data URLs, maintaining quality

5. **Retry Mechanism**: The extension automatically retries if images don't load on first attempt

## Troubleshooting

### Button Not Visible

- Make sure you're on an actual Medium article page
- Check that the extension is loaded (chrome://extensions/)
- Try refreshing the page
- Check browser console for errors (F12)

### "Could not find article content"

- Make sure you're on an actual Medium article page
- Some Medium pages (homepage, profile) won't work
- Try refreshing the page and waiting for full load

### Images Missing After Posting

- The extension retries 3 times automatically
- Wait a moment after posting for images to fully load
- Check LinkedIn's image upload limits
- Very large images may take longer

### Title Not Showing

- Some Medium articles don't have a clear title element
- You can manually edit the title in LinkedIn

### Formatting Issues

- Some complex Medium formatting may not transfer perfectly
- Use LinkedIn's editor to make adjustments
- Report issues for future improvements

### Panel Won't Open

- Check that JavaScript is enabled
- Look for browser console errors
- Reload the extension from chrome://extensions/
- Refresh the Medium page

## Alternative: Extension Icon (Still Available)

If you prefer the traditional approach, you can still:
1. Click the extension icon in the Chrome toolbar
2. Use the popup interface
3. Same functionality, different UI

The floating button is designed for convenience while you're already on Medium.
