const ClipboardAPIStrategy = {
  async inject(editor, article) {
    console.log('[Clipboard API Strategy] Starting injection');
    console.log('[Clipboard API Strategy] Article has', article.content.length, 'blocks');
    
    try {
      const htmlContent = this.buildHTMLContent(article);
      console.log('[Clipboard API Strategy] Built HTML, length:', htmlContent.length);
      
      const success = await this.writeToClipboard(htmlContent);
      
      if (!success) {
        throw new Error('Failed to write to clipboard');
      }
      
      await this.triggerPaste(editor);
      
      await RetryHandler.delay(1000);
      
      const contentLength = (editor.innerHTML || editor.textContent || '').length;
      console.log('[Clipboard API Strategy] Final content length:', contentLength);
      
      if (contentLength < 100) {
        throw new Error('Content not pasted - editor is empty');
      }
      
      console.log('[Clipboard API Strategy] Success!');
      
      return {
        success: true,
        strategy: 'CLIPBOARD_API',
        contentLength: contentLength
      };
      
    } catch (error) {
      console.error('[Clipboard API Strategy] Failed:', error);
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
      console.log('[Clipboard API Strategy] Wrote to clipboard successfully');
      return true;
      
    } catch (error) {
      console.error('[Clipboard API Strategy] Clipboard write failed:', error);
      
      if (error.name === 'NotAllowedError') {
        console.error('[Clipboard API Strategy] Permission denied - browser blocked clipboard access');
      }
      
      return false;
    }
  },
  
  async triggerPaste(editor) {
    console.log('[Clipboard API Strategy] Triggering paste event');
    
    editor.focus();
    await RetryHandler.delay(100);
    
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    const dispatched = editor.dispatchEvent(pasteEvent);
    console.log('[Clipboard API Strategy] Paste event dispatched:', dispatched);
    
    await RetryHandler.delay(500);
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
            console.log('[Clipboard API Strategy] Skipping first image (thumbnail)');
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







