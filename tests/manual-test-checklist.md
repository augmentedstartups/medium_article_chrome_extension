# Manual Testing Checklist

## Pre-Testing Setup

- [ ] Extension loaded in Chrome
- [ ] Developer mode enabled
- [ ] Extension icon visible in toolbar
- [ ] Have access to Medium article
- [ ] Have access to LinkedIn account

## Test 1: Extension Installation

- [ ] Extension loads without errors
- [ ] No errors in chrome://extensions/
- [ ] Icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Popup shows "Ready" status

## Test 2: Medium Article Extraction

### Simple Article (Text Only)

- [ ] Navigate to Medium article with just text
- [ ] Click extension icon
- [ ] Click "Extract Article"
- [ ] Status changes to "Extracting article..."
- [ ] Preview appears after extraction
- [ ] Title is correct
- [ ] Stats show correct counts
- [ ] Preview text matches article

### Article with Images

- [ ] Navigate to Medium article with images
- [ ] Extract article
- [ ] Image count shows correctly
- [ ] Preview displays

### Article with Formatting

- [ ] Article with bold, italic, links
- [ ] Extract article
- [ ] Preview shows correct content

### Edge Cases

- [ ] Try extracting from Medium homepage (should fail gracefully)
- [ ] Try extracting from non-Medium page (should show error)
- [ ] Try extracting article with many images (10+)

## Test 3: LinkedIn Injection

### First Injection

- [ ] Extract a Medium article
- [ ] Click "Post to LinkedIn"
- [ ] New LinkedIn tab opens
- [ ] Page loads to article editor
- [ ] Content is injected automatically
- [ ] Title appears in title field
- [ ] Body content appears in editor
- [ ] Check for any console errors

### Image Verification

- [ ] Inject article with 3-5 images
- [ ] Verify all images appear
- [ ] Images are in correct positions
- [ ] Image captions preserved (if applicable)

### Formatting Verification

- [ ] Inject article with various formatting
- [ ] Verify headings render correctly
- [ ] Verify bold/italic preserved
- [ ] Verify links are clickable
- [ ] Verify lists render correctly

## Test 4: Retry Mechanism

- [ ] Monitor console during injection
- [ ] Look for retry attempts in logs
- [ ] Verify images eventually load
- [ ] Check success message appears

## Test 5: Storage and Caching

- [ ] Extract article
- [ ] Close popup
- [ ] Reopen popup within 5 minutes
- [ ] Verify preview still shows
- [ ] Verify "Post to LinkedIn" button visible
- [ ] Can post without re-extracting

## Test 6: Settings Page

- [ ] Click "Settings" link in popup
- [ ] Options page opens
- [ ] Can enter API key
- [ ] Click "Save Settings"
- [ ] Success message appears
- [ ] Close and reopen settings
- [ ] API key is still there (sync storage working)

## Test 7: Error Handling

- [ ] Try extracting from non-article page
- [ ] Error message displays clearly
- [ ] Can try again after error

## Test 8: Multiple Articles

- [ ] Extract article A
- [ ] View preview
- [ ] Navigate to article B
- [ ] Extract article B
- [ ] Verify article B replaces article A in storage
- [ ] Post article B successfully

## Test 9: Browser Console

- [ ] Check for any errors in popup console
- [ ] Check for errors in Medium page console
- [ ] Check for errors in LinkedIn page console
- [ ] Check for errors in service worker console

## Test 10: Real-World Workflow

- [ ] Find a Medium article you want to publish
- [ ] Extract it
- [ ] Review preview
- [ ] Post to LinkedIn
- [ ] Review on LinkedIn
- [ ] Make any edits needed
- [ ] Publish on LinkedIn
- [ ] Verify published article looks good

## Performance Tests

- [ ] Extract small article (<500 words, no images)
  - Time taken: _____ seconds
- [ ] Extract medium article (1000-2000 words, 3-5 images)
  - Time taken: _____ seconds
- [ ] Extract large article (3000+ words, 10+ images)
  - Time taken: _____ seconds

## Browser Compatibility

- [ ] Test on Chrome (latest)
- [ ] Test on Chrome (one version back)

## Notes

Record any issues, unexpected behavior, or suggestions here:

---

## Test Results Summary

Date: __________
Tester: __________
Version: 1.0.0

Pass: ___ / Total: ___
Fail: ___ / Total: ___

Critical Issues: 

Minor Issues:

Suggestions:

