# Cover Image Upload Flow

## Overview

The extension automatically uploads the **first image from your Medium article** as the LinkedIn cover image.

## Important: Which Image is Used?

- ✅ **Uses:** First image from your Medium article (already extracted as base64 data)
- ❌ **Does NOT use:** `tests/test_image_thumbnail.png` (that file is only for manual testing)

## Complete Flow

```
1. Article Extracted (with all images as base64)
   ↓
2. Get First Image from article.images[0]
   ↓
3. Convert base64 to File object
   ↓
4. Find "Upload from computer" button on LinkedIn
   ↓
5. Click the button → File dialog opens
   ↓
6. Wait for file input element to appear
   ↓
7. Programmatically set File to input.files
   ↓
8. Dispatch 'change' and 'input' events
   ↓
9. LinkedIn processes the upload (2 seconds)
   ↓
10. Wait for "Next" button to appear
   ↓
11. Click "Next" button
   ↓
12. Cover image is set! ✓
```

## Technical Details

### Step 1-2: Image Selection
- Uses `article.images[0]` from the extracted Medium article
- Image is already in base64 format (data URL)
- Example: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

### Step 3: File Conversion
```javascript
dataURLtoFile(dataURL, 'cover-image.jpg')
// Converts: base64 string → Blob → File object
// MIME type: Extracted from data URL
// Filename: 'cover-image.jpg'
```

### Step 4-5: Button Click
- Searches for button with text "Upload from computer"
- Simulates human click
- This makes the file input appear

### Step 6-8: File Upload
- File input is hidden but programmatically accessible
- Creates DataTransfer object
- Adds File to DataTransfer
- Sets input.files = dataTransfer.files
- Triggers change/input events

### Step 9-11: Next Button
- Waits up to 5 seconds for "Next" button
- Searches for button with text "Next"
- Clicks it to confirm upload
- If not found, continues anyway (non-critical)

## Debugging

Check console for these logs:

```
[LinkedIn Injector] Attempting to upload cover image...
[LinkedIn DOM] Found upload button...
[LinkedIn Injector] Clicked upload button
[LinkedIn DOM] Found file input
[LinkedIn Injector] Created file object: cover-image.jpg, 245678 bytes
[LinkedIn Injector] Waiting for Next button...
[LinkedIn DOM] Found Next button
[LinkedIn Injector] ✓ Clicked Next button
[LinkedIn Injector] Cover image upload complete
```

## Error Handling

- If upload button not found → Skip cover upload (non-critical)
- If file input not found → Error logged, continues
- If Next button not found → Warning logged, continues (might still work)

## Testing

To manually test with the test image:
1. Open `/tests/test_image_thumbnail.png`
2. Manually upload it on LinkedIn
3. Verify the workflow matches above

## Future Enhancements

- Option to skip cover image upload
- Option to choose which image to use (not always first)
- Retry mechanism if upload fails
- Progress indicator during upload

