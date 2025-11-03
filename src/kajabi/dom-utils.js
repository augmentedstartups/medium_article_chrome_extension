const KajabiDOM = {
  async waitForTitleField(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const titleField = document.querySelector('#blog_post_title') || 
                        document.querySelector('input[name="blog_post[title]"]');
      if (titleField) {
        console.log('[Kajabi DOM] Found title field');
        return titleField;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Could not find Kajabi title field');
  },

  async waitForTinyMCE(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const iframe = document.querySelector('#blog_post_content_ifr');
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        console.log('[Kajabi DOM] Found TinyMCE iframe');
        return iframe.contentDocument.body;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Could not find TinyMCE editor');
  },

  setInputValue(element, value) {
    element.focus();
    element.value = value;
    
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
  },

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

