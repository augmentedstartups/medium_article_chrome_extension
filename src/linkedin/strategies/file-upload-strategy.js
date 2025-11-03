const FileUploadStrategy = {
  async inject(editor, article) {
    console.log('[File Upload Strategy] Starting injection');
    console.log('[File Upload Strategy] Article has', article.content.length, 'blocks');
    console.log('[File Upload Strategy] This will take 2-5 seconds per image');
    console.log('[File Upload Strategy] Processing blocks IN ORDER: text → image → text → image...');
    
    try {
      editor.focus();
      await RetryHandler.delay(300);
      
      let imageCount = 0;
      let uploadedImages = 0;
      let blockNumber = 0;
      
      for (const block of article.content) {
        blockNumber++;
        console.log(`[File Upload Strategy] Block ${blockNumber}/${article.content.length}: ${block.type}`);
        
        if (block.type === 'p' || block.type.startsWith('h')) {
          console.log(`[File Upload Strategy] → Inserting text block (${block.type})`);
          await this.insertTextBlock(editor, block);
          
        } else if (block.type === 'image') {
          imageCount++;
          
          if (imageCount === 1) {
            console.log('[File Upload Strategy] → ⏭️  Skipping first image (used as thumbnail)');
            continue;
          }
          
          console.log(`[File Upload Strategy] → 🖼️  Uploading image ${imageCount} at position ${blockNumber}...`);
          await this.uploadImageAsFile(editor, block, imageCount);
          uploadedImages++;
          
          console.log(`[File Upload Strategy] → ✅ Image ${imageCount} uploaded (${uploadedImages} total body images)`);
          
        } else if (block.type === 'ul' || block.type === 'ol') {
          console.log(`[File Upload Strategy] → Inserting list block (${block.type})`);
          await this.insertListBlock(editor, block);
          
        } else if (block.type === 'blockquote' || block.type === 'quote') {
          console.log(`[File Upload Strategy] → Inserting blockquote`);
          await this.insertTextBlock(editor, { type: 'p', content: `"${block.content}"` });
          
        } else if (block.type === 'code') {
          console.log(`[File Upload Strategy] → Inserting code block`);
          await this.insertCodeBlock(editor, block);
        }
      }
      
      console.log('[File Upload Strategy] ───────────────────────────────────────');
      console.log('[File Upload Strategy] 🎯 Uploading final CTA image...');
      const ctaImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
      await this.uploadImageFromURL(editor, ctaImageURL, 'CTA');
      
      console.log('[File Upload Strategy] ═══════════════════════════════════════');
      console.log('[File Upload Strategy] ✅ SUCCESS!');
      console.log('[File Upload Strategy] Total blocks processed:', blockNumber);
      console.log('[File Upload Strategy] Body images uploaded:', uploadedImages);
      console.log('[File Upload Strategy] CTA image uploaded: 1');
      console.log('[File Upload Strategy] Total images:', uploadedImages + 1);
      console.log('[File Upload Strategy] ═══════════════════════════════════════');
      
      return {
        success: true,
        strategy: 'FILE_UPLOAD',
        imagesUploaded: uploadedImages + 1,
        blocksProcessed: blockNumber
      };
      
    } catch (error) {
      console.error('[File Upload Strategy] Failed:', error);
      throw error;
    }
  },
  
  async insertTextBlock(editor, block) {
    const isHeading = block.type.startsWith('h');
    const text = isHeading ? `<strong>${block.content}</strong>` : block.content;
    
    editor.focus();
    await RetryHandler.delay(100);
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    document.execCommand('insertHTML', false, `<p class="article-editor-paragraph">${text}</p>`);
    
    await RetryHandler.delay(200);
  },
  
  async insertListBlock(editor, block) {
    const listType = block.type === 'ul' ? 'ul' : 'ol';
    let html = `<${listType} class="article-editor-list">`;
    block.items.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += `</${listType}>`;
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    document.execCommand('insertHTML', false, html);
    
    await RetryHandler.delay(100);
  },
  
  async insertCodeBlock(editor, block) {
    const html = `<pre class="article-editor-code-block"><code>${this.escapeHTML(block.content)}</code></pre>`;
    
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    document.execCommand('insertHTML', false, html);
    
    await RetryHandler.delay(100);
  },
  
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  async uploadImageAsFile(editor, imageBlock, imageNumber) {
    try {
      editor.focus();
      await RetryHandler.delay(300);
      
      const existingInputs = document.querySelectorAll('input[type="file"]');
      existingInputs.forEach(input => input.remove());
      console.log(`[File Upload Strategy] Cleaned up ${existingInputs.length} old file inputs`);
      
      const uploadBtn = await this.findImageUploadButton();
      
      uploadBtn.click();
      console.log(`[File Upload Strategy] Clicked upload button for image ${imageNumber}`);
      
      await RetryHandler.delay(800);
      
      const fileInput = await this.waitForFileInput();
      console.log(`[File Upload Strategy] Found file input for image ${imageNumber}`);
      
      const file = await LinkedInDOM.dataURLtoFile(
        imageBlock.dataURL || imageBlock.src,
        `image-${imageNumber}.jpg`
      );
      console.log(`[File Upload Strategy] Created file object:`, file.name, file.size, 'bytes');
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      fileInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      console.log(`[File Upload Strategy] Waiting for Next button for image ${imageNumber}...`);
      await RetryHandler.delay(2000);
      
      const nextButton = await this.waitForNextButton();
      console.log(`[File Upload Strategy] Found Next button for image ${imageNumber}:`, nextButton);
      console.log(`[File Upload Strategy] Button text:`, nextButton.textContent);
      console.log(`[File Upload Strategy] Button aria-label:`, nextButton.getAttribute('aria-label'));
      
      nextButton.focus();
      await RetryHandler.delay(200);
      
      nextButton.click();
      console.log(`[File Upload Strategy] ✓ Clicked Next button for image ${imageNumber}`);
      
      await this.waitForModalClose();
      console.log(`[File Upload Strategy] ✓ Modal closed for image ${imageNumber}`);
      
      await this.waitForImageInEditor();
      console.log(`[File Upload Strategy] ✓ Image ${imageNumber} confirmed in editor`);
      
      await RetryHandler.delay(1000);
      
      editor.focus();
      await RetryHandler.delay(300);
      
    } catch (error) {
      console.error(`[File Upload Strategy] Failed to upload image ${imageNumber}:`, error);
      throw error;
    }
  },
  
  async uploadImageFromURL(editor, imageURL, label) {
    try {
      const response = await fetch(imageURL);
      const blob = await response.blob();
      const dataURL = await this.blobToDataURL(blob);
      
      await this.uploadImageAsFile(editor, { dataURL: dataURL }, label);
      
    } catch (error) {
      console.error('[File Upload Strategy] Failed to upload image from URL:', error);
      throw error;
    }
  },
  
  async blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  
  async findImageUploadButton() {
    const selectors = [
      'button [data-test-icon="image-medium"]',
      'button svg[data-test-icon="image-medium"]',
      'button .scaffold-formatted-text-editor-icon[data-test-icon="image-medium"]',
      'button[aria-label*="Add image"]',
      'button[aria-label*="Insert image"]',
      'button[aria-label*="Upload image"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const button = element.closest('button') || element;
        console.log('[File Upload Strategy] Found upload button with selector:', selector);
        return button;
      }
    }
    
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const svg = button.querySelector('svg[data-test-icon="image-medium"]');
      if (svg) {
        console.log('[File Upload Strategy] Found upload button via SVG data-test-icon');
        return button;
      }
      
      const label = button.getAttribute('aria-label') || '';
      const text = button.textContent.toLowerCase();
      if (label.toLowerCase().includes('image') || text.includes('image')) {
        console.log('[File Upload Strategy] Found upload button by text/label');
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
        return inputs[0];
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('File input did not appear after clicking upload button');
  },
  
  async waitForImageInEditor(timeout = 10000) {
    const startTime = Date.now();
    const initialImageCount = document.querySelectorAll('.article-editor-inline-image__image').length;
    
    while (Date.now() - startTime < timeout) {
      const currentImageCount = document.querySelectorAll('.article-editor-inline-image__image').length;
      
      if (currentImageCount > initialImageCount) {
        console.log('[File Upload Strategy] Image confirmed - count increased from', initialImageCount, 'to', currentImageCount);
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.warn('[File Upload Strategy] Timeout waiting for image confirmation');
    return false;
  },
  
  async waitForNextButton(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const selectors = [
        'button[aria-label="Next"]',
        'button.share-box-footer__primary-btn',
        'button.artdeco-button--primary'
      ];
      
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          const text = button.textContent.trim().toLowerCase();
          if (text.includes('next')) {
            console.log('[File Upload Strategy] Found Next button with selector:', selector);
            return button;
          }
        }
      }
      
      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        const ariaLabel = button.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.toLowerCase() === 'next') {
          console.log('[File Upload Strategy] Found Next button via aria-label');
          return button;
        }
        
        const buttonText = button.querySelector('.artdeco-button__text');
        if (buttonText) {
          const text = buttonText.textContent.trim().toLowerCase();
          if (text === 'next') {
            console.log('[File Upload Strategy] Found Next button via .artdeco-button__text');
            return button;
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Next button did not appear after file upload');
  },
  
  async waitForModalClose(timeout = 10000) {
    const startTime = Date.now();
    let lastCheck = '';
    
    while (Date.now() - startTime < timeout) {
      const nextButtons = document.querySelectorAll('button[aria-label="Next"]');
      const shareFooter = document.querySelector('.share-box-footer');
      const modals = document.querySelectorAll('[role="dialog"], .artdeco-modal');
      
      const status = `Modals: ${modals.length}, ShareFooter: ${shareFooter ? 'yes' : 'no'}, NextButtons: ${nextButtons.length}`;
      if (status !== lastCheck) {
        console.log('[File Upload Strategy] Modal status:', status);
        lastCheck = status;
      }
      
      if (!shareFooter && nextButtons.length === 0 && modals.length === 0) {
        console.log('[File Upload Strategy] ✓ Modal fully closed - all elements gone');
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.error('[File Upload Strategy] ❌ Modal still open after timeout!');
    console.log('[File Upload Strategy] Remaining elements:', {
      modals: document.querySelectorAll('[role="dialog"], .artdeco-modal').length,
      shareFooter: !!document.querySelector('.share-box-footer'),
      nextButtons: document.querySelectorAll('button[aria-label="Next"]').length
    });
    return false;
  }
};

