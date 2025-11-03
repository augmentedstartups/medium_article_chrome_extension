# Speed Configuration Guide

## Overview

The extension includes configurable delays to ensure reliable operation across different internet speeds and system performance. You can adjust these to match your setup.

## Current Setting: **FAST** Profile ⚡

The extension is currently set to the **fast** profile, optimized for:
- Fast internet connection (50+ Mbps)
- Modern computer (8GB+ RAM)
- Quick LinkedIn page loads

## Speed Profiles

### Fast Profile ⚡ (CURRENT)
```javascript
newTabWait: 2500ms          // New LinkedIn tab
existingTabWait: 1500ms     // Existing tab reload
titleToEditor: 200ms        // Title → Editor transition
editorReady: 300ms          // Editor ready check
afterPasteCheck: 300ms      // After paste verification
betweenRetries: 500ms       // Between insertion retries
beforeCoverUpload: 500ms    // Before cover image upload
afterFileUpload: 1000ms     // After file upload
```

**Total time estimate:**
- New tab: ~6-8 seconds
- Existing tab: ~4-5 seconds

### Normal Profile 🔵 (Default)
```javascript
newTabWait: 4000ms
existingTabWait: 2500ms
titleToEditor: 500ms
editorReady: 500ms
afterPasteCheck: 500ms
betweenRetries: 1000ms
beforeCoverUpload: 1000ms
afterFileUpload: 2000ms
```

**Total time estimate:**
- New tab: ~10-12 seconds
- Existing tab: ~7-8 seconds

### Slow Profile 🐢
```javascript
newTabWait: 6000ms
existingTabWait: 4000ms
titleToEditor: 800ms
editorReady: 800ms
afterPasteCheck: 800ms
betweenRetries: 1500ms
beforeCoverUpload: 1500ms
afterFileUpload: 3000ms
```

**Total time estimate:**
- New tab: ~15-18 seconds
- Existing tab: ~10-12 seconds

## How to Change Speed Profile

### Option 1: Edit Config File (Recommended)

Open `/src/shared/config.js` and change the last line:

```javascript
// For fast connection
Config.setProfile('fast');

// For normal connection
Config.setProfile('normal');

// For slow connection
Config.setProfile('slow');
```

### Option 2: Custom Delays

Edit `/src/shared/config.js` and modify individual delays:

```javascript
const Config = {
  delays: {
    newTabWait: 2000,        // Your custom value
    existingTabWait: 1000,   // Your custom value
    // ... etc
  }
};
```

## Delay Explanations

### Critical Delays (Don't reduce too much)
- **newTabWait**: LinkedIn needs time to initialize editor on new tab
  - Min recommended: 2000ms (fast connection)
  - Issues if too low: Content won't paste
  
- **existingTabWait**: Tab reload and re-initialization
  - Min recommended: 1000ms
  - Issues if too low: Content may be empty

- **afterFileUpload**: LinkedIn processes uploaded image
  - Min recommended: 800ms
  - Issues if too low: "Next" button won't appear

### Safe to Reduce
- **titleToEditor**: Just a transition delay
  - Can go as low as: 100ms
  
- **afterInsertAttempt**: Focus transition
  - Can go as low as: 100ms
  
- **afterPasteCheck**: Verification delay
  - Can go as low as: 200ms

### Moderate Risk
- **betweenRetries**: Retry delay if content fails
  - Min recommended: 300ms
  - Issues if too low: May not give editor enough time to recover

- **beforeCoverUpload**: Find upload button
  - Min recommended: 300ms
  - Issues if too low: Button may not be found

## Recommended Settings by Connection

### Fiber/Fast (100+ Mbps)
```javascript
Config.setProfile('fast');
```
Or even more aggressive:
```javascript
Config.delays.newTabWait = 2000;
Config.delays.existingTabWait = 1000;
```

### Cable/Normal (25-100 Mbps)
```javascript
Config.setProfile('normal');
```

### DSL/Slow (<25 Mbps)
```javascript
Config.setProfile('slow');
```

## Testing Your Settings

After changing settings:

1. **Reload Extension:**
   ```
   chrome://extensions/ → Refresh
   ```

2. **Test New Tab** (harder test):
   - Close all LinkedIn tabs
   - Extract and post article
   - Check if content appears

3. **Test Existing Tab** (easier test):
   - Keep LinkedIn article tab open
   - Extract and post article
   - Should work faster

4. **Check Console** for timing logs:
   ```
   [Service Worker] Waiting 2500 ms for new tab editor...
   ```

## Troubleshooting

### Content not pasting?
- Increase `newTabWait` and `existingTabWait`
- Increase `betweenRetries`

### Cover image not uploading?
- Increase `beforeCoverUpload`
- Increase `afterFileUpload`
- Increase `afterButtonClick`

### Too slow?
- Reduce `newTabWait` by 500ms at a time
- Test after each reduction
- Find your optimal balance

## Current Version: 1.3.0

- Default profile: **FAST** ⚡
- Optimized for modern systems with fast internet
- Total time: ~6-8 seconds for new tab, ~4-5 seconds for existing tab



