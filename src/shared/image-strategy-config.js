const ImageStrategy = {
  CLIPBOARD_API: 'CLIPBOARD_API',
  FILE_UPLOAD: 'FILE_UPLOAD',
  USER_PASTE: 'USER_PASTE',
  PROSEMIRROR: 'PROSEMIRROR'
};

const StrategyDescriptions = {
  CLIPBOARD_API: {
    name: 'Clipboard API',
    description: 'Uses navigator.clipboard.write() to write HTML to clipboard, then dispatches paste event',
    pros: 'Fast, fully automated',
    cons: 'May be blocked by browser security',
    likelihood: 'Low - probably blocked'
  },
  FILE_UPLOAD: {
    name: 'File Upload (RECOMMENDED)',
    description: 'Uploads each image individually via LinkedIn\'s upload button (like cover image)',
    pros: 'Most reliable - uses LinkedIn\'s native upload, images persist on refresh',
    cons: 'Slower (2-5s per image)',
    likelihood: 'High - working ✓'
  },
  USER_PASTE: {
    name: 'User Paste',
    description: 'Writes to clipboard and shows overlay instructing user to press Ctrl+V',
    pros: 'Uses real paste handler, reliable',
    cons: 'Requires user action (semi-automated)',
    likelihood: 'High - should work'
  },
  PROSEMIRROR: {
    name: 'ProseMirror',
    description: 'Directly injects content via LinkedIn\'s ProseMirror editor transactions',
    pros: 'Fast, works with editor internals',
    cons: 'May be obfuscated, could break',
    likelihood: 'Medium - depends on access'
  }
};

const DEFAULT_STRATEGY = ImageStrategy.FILE_UPLOAD;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageStrategy, StrategyDescriptions, DEFAULT_STRATEGY };
}



