const UserPasteStrategy = {
  async inject(editor, article) {
    console.log('[User Paste Strategy] Starting injection');
    console.log('[User Paste Strategy] Article has', article.content.length, 'blocks');
    
    try {
      const htmlContent = this.buildHTMLContent(article);
      console.log('[User Paste Strategy] Built HTML, length:', htmlContent.length);
      
      const success = await this.writeToClipboard(htmlContent);
      
      if (!success) {
        throw new Error('Failed to write to clipboard');
      }
      
      await this.showPasteOverlay(editor);
      
      const contentLength = (editor.innerHTML || editor.textContent || '').length;
      console.log('[User Paste Strategy] Final content length:', contentLength);
      
      if (contentLength < 100) {
        console.warn('[User Paste Strategy] Content appears empty - user may not have pasted');
      }
      
      console.log('[User Paste Strategy] Complete');
      
      return {
        success: true,
        strategy: 'USER_PASTE',
        contentLength: contentLength,
        requiresUserAction: true
      };
      
    } catch (error) {
      console.error('[User Paste Strategy] Failed:', error);
      throw error;
    }
  },
  
  async writeToClipboard(htmlContent) {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([this.stripHTML(htmlContent)], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      console.log('[User Paste Strategy] Content written to clipboard');
      return true;
      
    } catch (error) {
      console.error('[User Paste Strategy] Clipboard write failed:', error);
      return false;
    }
  },
  
  async showPasteOverlay(editor) {
    return new Promise((resolve) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const shortcut = isMac ? 'Cmd+V' : 'Ctrl+V';
      
      const overlay = document.createElement('div');
      overlay.id = 'user-paste-overlay';
      overlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                    background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; 
                    align-items: center; justify-content: center;">
          <div style="background: white; padding: 40px; border-radius: 12px; 
                      box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-width: 500px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">📋</div>
            <h2 style="font-size: 24px; margin-bottom: 16px; color: #333;">Ready to Paste!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 24px;">
              Content has been copied to your clipboard.<br>
              Click in the editor below and press <strong style="color: #667eea;">${shortcut}</strong>
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button id="user-paste-done" style="background: #10b981; color: white; border: none; 
                      padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; 
                      cursor: pointer;">Done</button>
              <button id="user-paste-cancel" style="background: #ef4444; color: white; border: none; 
                      padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; 
                      cursor: pointer;">Cancel</button>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 16px;">
              This overlay will auto-close after you paste
            </p>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      console.log('[User Paste Strategy] Overlay displayed');
      
      editor.focus();
      
      const handlePaste = () => {
        console.log('[User Paste Strategy] Paste detected!');
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.remove();
          }
          resolve();
        }, 500);
      };
      
      const handleDone = () => {
        console.log('[User Paste Strategy] User clicked Done');
        if (overlay.parentNode) {
          overlay.remove();
        }
        resolve();
      };
      
      const handleCancel = () => {
        console.log('[User Paste Strategy] User clicked Cancel');
        if (overlay.parentNode) {
          overlay.remove();
        }
        resolve();
      };
      
      editor.addEventListener('paste', handlePaste, { once: true });
      
      document.getElementById('user-paste-done').addEventListener('click', handleDone);
      document.getElementById('user-paste-cancel').addEventListener('click', handleCancel);
      
      setTimeout(() => {
        if (overlay.parentNode) {
          console.log('[User Paste Strategy] Auto-closing overlay after 30 seconds');
          overlay.remove();
          resolve();
        }
      }, 30000);
    });
  },
  
  stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  
  buildHTMLContent(article) {
    let html = '';
    let imageCount = 0;
    
    for (const block of article.content) {
      switch (block.type) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
          html += `<p class="article-editor-paragraph"><strong>${this.escapeHTML(block.content)}</strong></p>`;
          break;
        case 'p':
          html += `<p class="article-editor-paragraph">${this.escapeHTML(block.content)}</p>`;
          break;
        case 'image':
          imageCount++;
          if (imageCount === 1) {
            console.log('[User Paste Strategy] Skipping first image (thumbnail)');
            continue;
          }
          
          const imageSrc = block.src || block.dataURL;
          const figureId = this.generateId();
          html += `
<figure class="article-editor-figure-image" data-id="${figureId}">
  <div class="article-editor-inline-image__container article-editor-inline-image__container--full-width" contenteditable="false">
    <img src="${imageSrc}" alt="${this.escapeHTML(block.alt || '')}" class="article-editor-inline-image__image">
  </div>
  <figcaption contenteditable="false" class="is-empty">
    <textarea class="article-editor-figure-caption" maxlength="250" placeholder="Add a caption (optional)"></textarea>
  </figcaption>
</figure>
`;
          break;
        case 'ul':
          html += '<ul class="article-editor-list">';
          block.items.forEach(item => {
            html += `<li>${this.escapeHTML(item)}</li>`;
          });
          html += '</ul>';
          break;
        case 'ol':
          html += '<ol class="article-editor-list">';
          block.items.forEach(item => {
            html += `<li>${this.escapeHTML(item)}</li>`;
          });
          html += '</ol>';
          break;
        case 'blockquote':
        case 'quote':
          html += `<blockquote class="article-editor-blockquote">${this.escapeHTML(block.content)}</blockquote>`;
          break;
        case 'code':
          html += `<pre class="article-editor-code-block"><code>${this.escapeHTML(block.content)}</code></pre>`;
          break;
      }
    }
    
    const ctaImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
    html += `
<figure class="article-editor-figure-image" data-id="${this.generateId()}">
  <div class="article-editor-inline-image__container article-editor-inline-image__container--full-width" contenteditable="false">
    <img src="${ctaImageURL}" alt="AI Automation Audit Call-to-Action" class="article-editor-inline-image__image">
  </div>
</figure>
`;
    
    return html;
  },
  
  escapeHTML(value = '') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  generateId() {
    return 'img-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }
};



