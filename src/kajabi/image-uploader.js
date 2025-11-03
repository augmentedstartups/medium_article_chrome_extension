const KajabiImageUploader = {
  async uploadImage(imageBlock, imageNumber, editorBody) {
    try {
      console.log(`[Kajabi Image] Starting upload for image ${imageNumber}`);
      
      await this.ensureCursorAtEndForUpload();
      await this.delay(500);
      
      const uploadBtn = await this.findImageUploadButton();
      console.log(`[Kajabi Image] Found upload button`);
      
      uploadBtn.click();
      await this.delay(1000);
      
      const fileInput = await this.waitForFileInput();
      console.log(`[Kajabi Image] Found file input`);
      
      const file = await this.dataURLtoFile(
        imageBlock.dataURL || imageBlock.src,
        `image-${imageNumber}.jpg`
      );
      console.log(`[Kajabi Image] Created file:`, file.name, file.size, 'bytes');
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      console.log(`[Kajabi Image] File dispatched, waiting for upload...`);
      await this.delay(2000);
      
      await this.waitForImageInEditor(imageNumber);
      
      const insertBtn = await this.waitForInsertButton();
      if (insertBtn) {
        console.log(`[Kajabi Image] Found insert button, clicking...`);
        insertBtn.click();
        await this.delay(1000);
        
        await this.waitForModalClose();
        console.log(`[Kajabi Image] Modal closed`);
      }
      
      console.log(`[Kajabi Image] ✅ Image ${imageNumber} uploaded`);
      return true;
      
    } catch (error) {
      console.error(`[Kajabi Image] Failed to upload image ${imageNumber}:`, error);
      return false;
    }
  },
  
  async findImageUploadButton() {
    const selectors = [
      'button .mce-ico.mce-i-image',
      'button[aria-label*="image" i]',
      'button[aria-label*="Insert" i]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const button = element.closest('button') || element;
        console.log('[Kajabi Image] Found button with selector:', selector);
        return button;
      }
    }
    
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const icon = button.querySelector('.mce-ico.mce-i-image');
      if (icon) {
        console.log('[Kajabi Image] Found button via icon class');
        return button;
      }
    }
    
    throw new Error('Could not find image upload button');
  },
  
  async waitForFileInput(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const inputs = document.querySelectorAll('input[type="file"]');
      
      for (const input of inputs) {
        if (input.accept && input.accept.includes('image')) {
          return input;
        }
      }
      
      if (inputs.length > 0) {
        return inputs[inputs.length - 1];
      }
      
      await this.delay(100);
    }
    
    throw new Error('File input did not appear');
  },
  
  async waitForImageInEditor(imageNumber, timeout = 8000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const iframe = document.querySelector('#blog_post_content_ifr');
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const images = iframeDoc.querySelectorAll('img');
        
        if (images.length >= imageNumber) {
          console.log(`[Kajabi Image] Image ${imageNumber} appeared in editor`);
          return true;
        }
      }
      
      await this.delay(200);
    }
    
    console.log('[Kajabi Image] Image did not appear in editor within timeout');
    return false;
  },
  
  async waitForInsertButton(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const buttons = document.querySelectorAll('button');
      
      for (const button of buttons) {
        const text = button.textContent.toLowerCase();
        if (text.includes('insert') || text.includes('submit') || text.includes('add')) {
          return button;
        }
      }
      
      await this.delay(100);
    }
    
    console.log('[Kajabi Image] Insert button not found, assuming auto-inserted');
    return null;
  },
  
  async waitForModalClose(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const modals = document.querySelectorAll('.uppy-Dashboard, .mce-window, [role="dialog"]');
      
      if (modals.length === 0) {
        console.log('[Kajabi Image] Modal closed');
        return true;
      }
      
      await this.delay(100);
    }
    
    console.log('[Kajabi Image] Modal still visible after timeout');
    return false;
  },
  
  async ensureCursorAtEndForUpload() {
    const iframe = document.querySelector('#blog_post_content_ifr');
    if (!iframe || !iframe.contentWindow) {
      console.log('[Kajabi Image] Cannot find iframe for cursor positioning');
      return;
    }
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const body = iframeDoc.body;
      
      body.click();
      await this.delay(100);
      
      const lastChild = body.lastChild;
      if (lastChild) {
        const range = iframeDoc.createRange();
        range.selectNodeContents(lastChild);
        range.collapse(false);
        
        const selection = iframe.contentWindow.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[Kajabi Image] ✓ Cursor positioned at end (last child)');
      } else {
        const range = iframeDoc.createRange();
        range.selectNodeContents(body);
        range.collapse(false);
        
        const selection = iframe.contentWindow.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[Kajabi Image] ✓ Cursor positioned at end (body)');
      }
      
      body.focus();
      iframe.contentWindow.focus();
      
    } catch (error) {
      console.error('[Kajabi Image] Failed to position cursor:', error);
    }
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
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

