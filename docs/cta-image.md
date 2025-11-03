# Static CTA Image

## Overview

The extension automatically appends a static Call-to-Action (CTA) image to the end of every article posted to LinkedIn.

## Location

- **File:** `/assets/ritz_cta.png`
- **Purpose:** Consistent branding and call-to-action across all LinkedIn posts

## How It Works

1. When building the HTML content for LinkedIn, the extension automatically adds the CTA image at the end
2. The image is loaded from the extension's assets folder using `chrome.runtime.getURL()`
3. The image is inserted after all article content with proper styling

## Updating the CTA Image

To change the CTA image:

1. Replace `/assets/ritz_cta.png` with your new image
2. Keep the same filename, or update the reference in `src/linkedin/injector.js`
3. Reload the extension in Chrome
4. The new image will appear in all future posts

## Technical Details

- **Manifest Permission:** Listed in `web_accessible_resources` for LinkedIn access
- **Styling:** `max-width: 100%; height: auto;` for responsive display
- **Alt Text:** "AI Automation Audit Call-to-Action"

## Notes

- This is a static image that cannot be changed per-post
- The image is embedded as part of the HTML content
- It will appear on LinkedIn exactly as it appears in the file
- Recommended size: 700px width or larger for clarity

