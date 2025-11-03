# Architecture Documentation

## Overview

This Chrome extension uses Manifest V3 architecture with content scripts, a background service worker, and a popup UI to facilitate article transfer from Medium to LinkedIn.

## Component Structure

### Folder Organization

```
medium_article_chrome_extension/
├── manifest.json              # Extension configuration
├── icons/                     # Extension icons
├── src/
│   ├── medium/               # Medium extraction logic
│   │   ├── extractor.js     # Main extraction orchestrator
│   │   └── parser.js        # HTML parsing utilities
│   ├── linkedin/             # LinkedIn injection logic
│   │   ├── injector.js      # Main injection orchestrator
│   │   ├── retry-handler.js # Retry mechanism for reliability
│   │   └── dom-utils.js     # DOM manipulation helpers
│   ├── shared/               # Shared utilities
│   │   ├── storage.js       # Chrome storage wrapper
│   │   ├── messaging.js     # Chrome messaging helpers
│   │   └── logger.js        # Logging utility
│   ├── background/           # Service worker
│   │   └── service-worker.js
│   └── popup/                # Extension UI
│       ├── popup.html
│       ├── popup.css
│       ├── popup.js
│       ├── options.html
│       └── options.js
├── docs/                      # Documentation
└── tests/                     # Test files
```

## Data Flow

### Extraction Flow

1. User clicks "Extract Article" in popup
2. Popup sends message to service worker
3. Service worker forwards message to Medium content script
4. Medium extractor:
   - Parses article DOM
   - Extracts title, subtitle, content blocks
   - Converts images to data URLs (base64)
   - Returns structured article object
5. Service worker stores article in chrome.storage.local
6. Popup displays preview

### Injection Flow

1. User clicks "Post to LinkedIn" in popup
2. Popup sends article to service worker
3. Service worker:
   - Opens new tab to LinkedIn article editor
   - Waits for page load
   - Sends article to LinkedIn content script
4. LinkedIn injector:
   - Waits for editor DOM to be ready
   - Injects title into title field
   - Builds HTML from article structure
   - Simulates paste event with content
   - Verifies images loaded
   - Retries up to 3 times if needed
5. Reports success/failure back to popup

## Key Design Decisions

### Image Handling

**Problem**: Cross-origin image restrictions prevent direct copying

**Solution**: Convert images to base64 data URLs during extraction
- Images are fetched and converted to blobs
- Blobs are read as data URLs
- Data URLs can be injected anywhere without CORS issues

**Trade-off**: Larger data size, but ensures reliability

### Retry Mechanism

**Problem**: LinkedIn editor sometimes doesn't load images on first paste

**Solution**: Automatic retry with verification
- Wait and verify images loaded
- Retry up to 3 times with 2-second delays
- Report statistics on loaded vs failed images

### DOM Detection

**Problem**: LinkedIn's DOM structure may change

**Solution**: Multiple selector fallbacks
- Try multiple possible selectors for each element
- Generic selectors (contenteditable, role) more stable
- Easy to add new selectors if structure changes

### Content Script Injection

**Problem**: Content scripts need to be ready before messaging

**Solution**: 
- Scripts run at `document_idle` (after DOM ready)
- Service worker waits for tab `complete` status
- Additional 3-second buffer for dynamic content
- Timeout mechanisms prevent infinite waiting

## Message Passing

### Message Types

**To Service Worker**:
- `extractAndStore`: Extract article from current tab
- `openLinkedInAndInject`: Open LinkedIn and inject article

**To Medium Content Script**:
- `extractArticle`: Trigger article extraction

**To LinkedIn Content Script**:
- `injectArticle`: Inject article into editor

### Response Format

All responses follow this structure:
```javascript
{
  success: boolean,
  data?: any,        // On success
  error?: string     // On failure
}
```

## Storage

### chrome.storage.local

- `extractedArticle`: Currently extracted article object
- `extractedAt`: Timestamp of extraction (for 5-minute cache)

### chrome.storage.sync

- `openaiKey`: User's OpenAI API key (for future Kajabi features)

## Future Enhancements

### Phase 2: Kajabi Support

- New content script for Kajabi pages
- AI-powered metadata generation using OpenAI API
- URL slug generation
- SEO description generation (under 160 chars)
- Page title optimization (under 60 chars)

### Potential Improvements

- Support for more content types (embeds, tables)
- Batch processing multiple articles
- Custom formatting templates
- Article scheduling
- Analytics tracking

