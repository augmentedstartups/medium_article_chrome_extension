# Test Button Usage Guide

## Overview

A test button has been added to LinkedIn to test the FILE_UPLOAD strategy with fixed test data. This allows you to validate the upload functionality without needing to extract content from Medium.

## How It Works

### Test Button Location
- The test button appears in the **top-right corner** of LinkedIn pages
- It's visible when you're on article creation/editing pages
- Styled with a purple gradient background: **🧪 Insert Test Article**

### Test Article Structure

The test article includes:
- **Title**: "Test Article: LinkedIn Upload Validation"
- **Pattern**: Text → Image → Text → Image → Text → Image → Text
- **Content Blocks**: 9 total blocks
  - 5 text paragraphs (including 1 heading)
  - 3 images (using the same test image)
- **Cover Image**: Uses the first image from the test data

### Test Data

All images use the same source: `assets/ritz_cta.png`

The content follows this exact pattern:
1. Paragraph 1
2. Image 1
3. Paragraph 2
4. Heading
5. Paragraph 3
6. Image 2
7. Paragraph 4
8. Image 3
9. Paragraph 5

## Usage Instructions

### Step 1: Load the Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory
6. Make sure the extension is enabled

### Step 2: Navigate to LinkedIn
1. Go to https://www.linkedin.com
2. Navigate to article creation:
   - Click "Write article" or
   - Go to https://www.linkedin.com/article/new

### Step 3: Click the Test Button
1. Look for the **🧪 Insert Test Article** button in the top-right corner
2. Click the button
3. The button will show:
   - **⏳ Inserting...** while processing
   - **✅ Inserted!** on success (green)
   - **❌ Failed** on error (red)

### Step 4: Observe the Console
Open Chrome DevTools (F12) to monitor the injection process:
- Look for `[File Upload Strategy]` logs
- Watch the sequential insertion of text and images
- Verify all blocks are processed

## What to Verify

### Success Indicators
- ✅ Title is inserted
- ✅ All text paragraphs appear in order
- ✅ All 3 body images are uploaded
- ✅ CTA image is appended at the end
- ✅ Cover image is uploaded
- ✅ Content persists after page refresh

### Known Issues to Check
1. **Does only one image upload?** (Previous issue)
2. **Is text being skipped?** (Previous issue)
3. **Does content persist after refresh?** (Previous issue)
4. **Are images in the correct positions?**

## Console Output

You should see logs like:
```
[Test Button] Button clicked
[Test Button] 🚀 STARTING TEST INJECTION
[Test Button] ✅ Title injected
[Test Button] ✅ Editor found
[File Upload Strategy] Starting injection
[File Upload Strategy] Block 1/9: p
[File Upload Strategy] → Inserting text block (p)
[File Upload Strategy] Block 2/9: image
[File Upload Strategy] → 🖼️ Uploading image 1...
[File Upload Strategy] → ✅ Image 1 uploaded
...
[Test Button] ✅ ✅ TEST INJECTION COMPLETE ✅ ✅
```

## Troubleshooting

### Button Doesn't Appear
- Refresh the LinkedIn page
- Check if you're on an article creation page
- Verify the extension is loaded in `chrome://extensions/`

### Injection Fails
- Check the console for error messages
- Look for which block failed
- Verify LinkedIn's editor is ready
- Try reloading the extension

### Images Don't Upload
- Check if the upload button is found
- Verify file input appears
- Look for timing issues in console logs
- Try increasing delays in `src/shared/config.js`

## File Locations

- Test data: `src/linkedin/test-data.js`
- Test button: `src/linkedin/test-button.js`
- Upload strategy: `src/linkedin/strategies/file-upload-strategy.js`
- Configuration: `src/shared/config.js`

