const MediumParser = {
  parseElement(element) {
    const tag = element.tagName.toLowerCase();
    const text = element.textContent.trim();

    if (tag === 'h1') {
      return { type: 'h1', content: text };
    } else if (tag === 'h2') {
      return { type: 'h2', content: text };
    } else if (tag === 'h3') {
      return { type: 'h3', content: text };
    } else if (tag === 'p') {
      return this.parseParagraph(element);
    } else if (tag === 'figure') {
      return this.parseFigure(element);
    } else if (tag === 'ul' || tag === 'ol') {
      return this.parseList(element);
    } else if (tag === 'blockquote') {
      return { type: 'quote', content: text };
    } else if (tag === 'pre') {
      return { type: 'code', content: text };
    }

    return null;
  },

  parseParagraph(element) {
    const html = element.innerHTML;
    let content = '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    tempDiv.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        content += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const text = node.textContent;
        
        if (tag === 'strong' || tag === 'b') {
          content += `<strong>${text}</strong>`;
        } else if (tag === 'em' || tag === 'i') {
          content += `<em>${text}</em>`;
        } else if (tag === 'a') {
          const href = node.getAttribute('href');
          content += `<a href="${href}">${text}</a>`;
        } else if (tag === 'code') {
          content += `<code>${text}</code>`;
        } else {
          content += text;
        }
      }
    });

    return { type: 'p', content: content.trim() };
  },

  parseFigure(element) {
    const img = element.querySelector('img');
    if (img) {
      const src = img.src || 
                  img.getAttribute('data-src') || 
                  img.getAttribute('data-external-src') ||
                  img.getAttribute('src');
      const alt = img.alt || '';
      let caption = element.querySelector('figcaption')?.textContent.trim() || '';
      
      const placeholderTexts = [
        'Type caption for image (optional)',
        'Type caption for image',
        'Add a caption',
        'Caption (optional)'
      ];
      
      if (placeholderTexts.some(placeholder => caption.includes(placeholder))) {
        caption = '';
      }
      
      console.log('[Medium Parser] Image found:', { src, alt, hasCaption: !!caption });
      
      return {
        type: 'image',
        src: src,
        alt: alt,
        caption: caption
      };
    }
    return null;
  },

  parseList(element) {
    const type = element.tagName.toLowerCase() === 'ul' ? 'ul' : 'ol';
    const items = [];
    
    element.querySelectorAll('li').forEach(li => {
      items.push(li.textContent.trim());
    });

    return { type, items };
  },

  async imageToDataURL(url) {
    try {
      console.log('[Medium Parser] Fetching image:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      });
      
      if (!response.ok) {
        console.error('[Medium Parser] Fetch failed:', response.status, response.statusText);
        return url;
      }
      
      const blob = await response.blob();
      console.log('[Medium Parser] Blob size:', blob.size, 'type:', blob.type);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('[Medium Parser] Successfully converted to data URL');
          resolve(reader.result);
        };
        reader.onerror = (error) => {
          console.error('[Medium Parser] FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[Medium Parser] Failed to convert image to data URL:', url, error);
      return url;
    }
  }
};

