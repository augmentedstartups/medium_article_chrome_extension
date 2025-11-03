# Medium to LinkedIn Article Publisher

A Chrome extension that streamlines publishing Medium articles to LinkedIn with one click.

## Features

- **One-Click Extraction**: Extract articles from Medium with full formatting
- **Automatic Publishing**: Post directly to LinkedIn article editor
- **Image Handling**: Automatically converts and transfers images
- **Retry Mechanism**: Ensures images load correctly with automatic retries
- **Preview Before Posting**: Review extracted content before publishing
- **Clean UI**: Simple, beautiful interface for quick workflow

## Quick Start

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder
5. Extension icon will appear in toolbar

### Usage

1. Navigate to a Medium article
2. Click the extension icon
3. Click "Extract Article"
4. Review the preview
5. Click "Post to LinkedIn"
6. Review and publish on LinkedIn

## Documentation

- [Installation Guide](docs/installation.md) - Detailed installation and setup
- [Usage Guide](docs/usage.md) - Complete usage instructions
- [Architecture](docs/architecture.md) - Technical documentation

## Supported Content

- Text with formatting (bold, italic, links)
- Headings (H1, H2, H3)
- Images with captions
- Lists (ordered and unordered)
- Block quotes
- Code blocks

## Requirements

- Google Chrome (latest version)
- Active internet connection
- Medium and LinkedIn accounts

## Current Status

**Phase 1**: Medium to LinkedIn ✅
- Extraction working
- Injection working
- Image transfer with retry logic
- Preview interface

**Phase 2**: Kajabi Support (Coming Soon)
- AI-powered metadata generation
- SEO optimization
- URL slug generation

## Technical Details

- **Manifest Version**: V3
- **Content Scripts**: Medium and LinkedIn
- **Service Worker**: Background coordination
- **Storage**: Chrome local and sync storage
- **No Backend Required**: Everything runs client-side

## Folder Structure

```
/src
  /medium      - Medium extraction logic
  /linkedin    - LinkedIn injection logic
  /shared      - Shared utilities
  /background  - Service worker
  /popup       - Extension UI
/docs          - Documentation
/tests         - Test files (manual)
/icons         - Extension icons
```

## Known Limitations

- Complex embeds (YouTube, Twitter) not supported
- Some advanced Medium formatting may be simplified
- Large images may take time to convert
- LinkedIn editor must fully load before injection

## Future Plans

1. Kajabi integration with AI metadata
2. Support for more content types
3. Batch article processing
4. Custom formatting templates
5. Analytics tracking

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review browser console for error messages
3. Ensure you're on the correct page (Medium article or LinkedIn editor)

## License

Personal use only.

## Version

1.0.0 - Initial release with Medium to LinkedIn functionality

