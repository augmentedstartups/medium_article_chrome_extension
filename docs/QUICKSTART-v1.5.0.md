# Quick Start Guide - v1.5.0

## What's New

Version 1.5.0 adds **4 different image injection strategies** to solve the image persistence problem on LinkedIn.

## The Problem We're Solving

Images were appearing in LinkedIn after paste but disappearing after page refresh.

## The Solution

Test 4 different strategies to find which one makes images persist.

---

## How to Test

### Step 1: Load the Extension

1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder
6. Extension should now appear with version **1.5.0**

### Step 2: Select a Strategy

1. Click the extension icon in Chrome toolbar
2. Look for "Image Injection Strategy" section
3. Select a strategy from dropdown:
   - **Strategy 1:** Clipboard API (Fast but might be blocked)
   - **Strategy 2:** File Upload (Slow but most reliable) ⭐ **Try this first**
   - **Strategy 3:** User Paste (Semi-automated, requires Ctrl+V)
   - **Strategy 4:** ProseMirror (Advanced, might not work)

4. Read the description that appears below the dropdown

### Step 3: Test It

1. Go to your Medium article
2. Click the **"Post to LinkedIn"** floating button (top right)
3. Wait for the process to complete
4. **Check LinkedIn tab:**
   - Title should be filled ✓
   - Body content should be there ✓
   - Images should be visible ✓
   - Cover image should be uploading ✓

### Step 4: THE CRITICAL TEST 🔄

**This is the most important step:**

1. **Refresh the LinkedIn page** (Press Cmd+R or Ctrl+R)
2. Look at the article editor
3. **Are the images still there?**
   - ✅ YES → **This strategy works!** Write it down.
   - ❌ NO → This strategy failed. Try the next one.

### Step 5: Test All Strategies

Repeat Steps 2-4 for each strategy until you find one that works.

**Document your results in:** `docs/image-persistence-testing.md`

---

## Recommended Testing Order

1. **Strategy 2: File Upload** ← Start here (most likely to work)
2. **Strategy 3: User Paste** ← Try second (requires pressing Ctrl+V)
3. **Strategy 1: Clipboard API** ← Try third (fast but might fail)
4. **Strategy 4: ProseMirror** ← Try last (advanced, least likely)

---

## Expected Results

### Strategy 2: File Upload

**What you'll see:**
- Images upload one by one (slow)
- Each image takes 2-5 seconds
- Console shows "Uploading image X..."
- Total time: ~30 seconds for 6 images

**Expected outcome:** ✅ Should persist after refresh

### Strategy 3: User Paste

**What you'll see:**
- Overlay appears with instructions
- You must press Ctrl+V (or Cmd+V on Mac)
- Content pastes when you press the key
- Overlay disappears

**Expected outcome:** ✅ Should persist after refresh

### Strategy 1: Clipboard API

**What you'll see:**
- Very fast (2-3 seconds)
- Content appears immediately
- Might show "NotAllowedError" in console

**Expected outcome:** ⚠️ Might be blocked or might not persist

### Strategy 4: ProseMirror

**What you'll see:**
- Fast (2-3 seconds)
- Console shows ProseMirror schema info
- Might show "Could not access ProseMirror view"

**Expected outcome:** ⚠️ Depends on editor access

---

## What To Do After Testing

1. **Found a working strategy?**
   - Write down which one it was
   - Keep using that strategy for all articles
   - Document in `docs/image-persistence-testing.md`

2. **None of them work?**
   - Check console for errors
   - Try with a different article (fewer images)
   - Make sure you're refreshing the page properly
   - Report findings

3. **Multiple strategies work?**
   - Choose the fastest one
   - Document all working strategies
   - Recommend default for future

---

## Troubleshooting

### "Extension failed to load"

**Fix:** Make sure all new files are present:
- `src/linkedin/strategies/` folder exists
- All 4 strategy files are in that folder
- `manifest.json` version is 1.5.0

### "Strategy selector not showing"

**Fix:** 
- Close and reopen extension popup
- Reload extension at `chrome://extensions`
- Clear browser cache

### "All strategies fail"

**Possible causes:**
- LinkedIn changed their editor structure
- Browser blocking certain operations
- Images are too large
- Network issues

**Try:**
- Use a different browser
- Try with smaller images
- Check if manual copy-paste from Medium works

### "File Upload strategy can't find button"

**Fix:**
- LinkedIn's UI might have changed
- Check console for specific error
- Button selectors might need updating

---

## Console Debugging

Open Chrome DevTools (F12) → Console tab

**Filter logs by strategy:**
```
[Clipboard API Strategy]  → Strategy 1 logs
[File Upload Strategy]    → Strategy 2 logs
[User Paste Strategy]     → Strategy 3 logs
[ProseMirror Strategy]    → Strategy 4 logs
```

**Look for:**
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning messages
- 📊 Verification results

---

## Important Files

**Testing checklist:**
- `docs/image-persistence-testing.md`

**Full documentation:**
- `docs/v1.5.0-image-strategies.md`

**Strategy implementations:**
- `src/linkedin/strategies/clipboard-api-strategy.js`
- `src/linkedin/strategies/file-upload-strategy.js`
- `src/linkedin/strategies/user-paste-strategy.js`
- `src/linkedin/strategies/prosemirror-strategy.js`

**Configuration:**
- `manifest.json` (version 1.5.0)
- `src/shared/image-strategy-config.js`

---

## Success Criteria

A strategy is successful if:

1. ✅ Images appear after injection
2. ✅ No errors in console
3. ✅ Images still visible after page refresh ← **Most important!**
4. ✅ Cover image also works
5. ✅ Reasonable speed (< 60 seconds)

---

## Next Steps After Finding Winner

1. Document which strategy worked in testing checklist
2. Keep that strategy selected in extension popup
3. Test with multiple different articles to confirm consistency
4. Consider making it the default in a future update

---

## Need Help?

Check these files for details:
- `docs/v1.5.0-image-strategies.md` - Full technical documentation
- `docs/image-persistence-testing.md` - Testing template
- Console logs - Detailed execution information

**Good luck testing! 🚀**

The goal is to find at least ONE strategy that makes images persist after refresh. Once you find it, the problem is solved! ✨







