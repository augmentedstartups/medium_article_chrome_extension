const LinkedInDOM = {
  async waitForElement(selector, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },

  async waitForEditor() {
    const possibleSelectors = [
      '[contenteditable="true"]',
      '.ql-editor',
      '[role="textbox"]',
      '.editor-content',
      '[data-placeholder*="article"]'
    ];

    for (const selector of possibleSelectors) {
      try {
        const element = await this.waitForElement(selector, 3000);
        if (element) {
          console.log('[LinkedIn DOM] Found editor with selector:', selector);
          return element;
        }
      } catch (e) {
      }
    }

    throw new Error('Could not find LinkedIn article editor');
  },

  async waitForTitleField() {
    const possibleSelectors = [
      'input[placeholder*="title" i]',
      'input[placeholder*="Title" i]',
      'textarea[placeholder*="title" i]',
      '.article-title input',
      '[data-testid="title-input"]'
    ];

    for (const selector of possibleSelectors) {
      try {
        const element = await this.waitForElement(selector, 3000);
        if (element) {
          console.log('[LinkedIn DOM] Found title field with selector:', selector);
          return element;
        }
      } catch (e) {
      }
    }

    throw new Error('Could not find LinkedIn title field');
  },

  setInputValue(element, value) {
    element.focus();
    element.value = value;
    
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  },

  setContentEditableValue(element, html) {
    element.focus();
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    
    element.innerHTML = html;
    
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  },

  simulatePaste(element, html) {
    element.focus();
    
    try {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/html', html);
      clipboardData.setData('text/plain', this.stripHTML(html));
      
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: clipboardData
      });
      
      const prevented = !element.dispatchEvent(pasteEvent);
      console.log('[LinkedIn DOM] Paste event prevented:', prevented);
      
      if (prevented || element.innerHTML.trim().length < 100) {
        console.log('[LinkedIn DOM] Paste blocked, using direct method');
        element.innerHTML = html;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {
      console.error('[LinkedIn DOM] Paste simulation failed:', e);
      element.innerHTML = html;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },

  stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  async findCoverUploadButton() {
    console.log('[LinkedIn DOM] Searching for cover upload button...');
    
    const possibleSelectors = [
      'button[aria-label*="Upload from computer"]',
      '.article-editor-cover-media__placeholder button',
      'button svg[data-test-icon="image-medium"]',
      'button svg[data-test-icon="upload-small"]',
      '.scaffold-formatted-text-editor-icon[data-test-icon="image-medium"]'
    ];

    for (const selector of possibleSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const button = element.closest('button') || element;
          console.log('[LinkedIn DOM] Found upload button with selector:', selector);
          return button;
        }
      } catch (e) {
        console.log('[LinkedIn DOM] Selector failed:', selector, e);
      }
    }

    console.log('[LinkedIn DOM] Trying to find button by SVG data-test-icon...');
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const svg = button.querySelector('svg[data-test-icon="image-medium"]');
      if (svg) {
        console.log('[LinkedIn DOM] Found upload button via image-medium SVG');
        return button;
      }
      
      const uploadSvg = button.querySelector('svg[data-test-icon="upload-small"]');
      if (uploadSvg) {
        console.log('[LinkedIn DOM] Found upload button via upload-small SVG');
        return button;
      }
      
      const text = button.textContent.toLowerCase();
      if (text.includes('upload') && text.includes('computer')) {
        console.log('[LinkedIn DOM] Found upload button by text content');
        return button;
      }
      
      if (text.includes('upload') || text.includes('add') && button.querySelector('svg')) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('upload') || ariaLabel.toLowerCase().includes('image')) {
          console.log('[LinkedIn DOM] Found upload button by aria-label:', ariaLabel);
          return button;
        }
      }
    }

    console.error('[LinkedIn DOM] Could not find cover upload button');
    console.log('[LinkedIn DOM] Available buttons:', allButtons.length);
    console.log('[LinkedIn DOM] First 5 buttons:', Array.from(allButtons).slice(0, 5).map(b => ({
      text: b.textContent.substring(0, 50),
      ariaLabel: b.getAttribute('aria-label'),
      hasSvg: !!b.querySelector('svg')
    })));
    
    throw new Error('Could not find upload button');
  },

  async waitForFileInput(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const inputs = document.querySelectorAll('input[type="file"]');
      for (const input of inputs) {
        if (input.accept && input.accept.includes('image')) {
          console.log('[LinkedIn DOM] Found file input');
          return input;
        }
      }
      
      if (inputs.length > 0) {
        console.log('[LinkedIn DOM] Found file input (no accept check)');
        return inputs[0];
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('File input did not appear after button click');
  },

  async waitForNextButton(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const possibleSelectors = [
        'button:has(.artdeco-button__text):contains("Next")',
        'button[aria-label*="Next"]',
        'button .artdeco-button__text'
      ];

      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        const text = button.textContent.trim().toLowerCase();
        if (text === 'next' || text.includes('next')) {
          console.log('[LinkedIn DOM] Found Next button');
          return button;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Next button did not appear after upload');
  },

  async dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  },

  generateNodeId(prefix = '') {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return prefix + window.crypto.randomUUID();
      }
    } catch (error) {
      console.warn('[LinkedIn DOM] randomUUID unavailable, using fallback', error);
    }

    const random = Math.random().toString(36).slice(2, 10);
    const timestamp = Date.now().toString(36);
    return `${prefix}${random}-${timestamp}`;
  }
};

