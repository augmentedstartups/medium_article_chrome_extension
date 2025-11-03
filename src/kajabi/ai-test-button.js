console.log('[Kajabi AI Test] Initializing test button...');

function injectAITestButton() {
  if (document.getElementById('kajabi-ai-test-btn')) {
    console.log('[Kajabi AI Test] Button already exists');
    return;
  }

  const button = document.createElement('button');
  button.id = 'kajabi-ai-test-btn';
  button.textContent = '🤖 Test AI Generation';
  button.style.cssText = `
    position: fixed;
    top: 120px;
    right: 20px;
    z-index: 999999;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
  });

  button.addEventListener('click', async () => {
    console.log('[Kajabi AI Test] Button clicked');
    await testAIGeneration(button);
  });

  document.body.appendChild(button);
  console.log('[Kajabi AI Test] ✅ Button injected');
}

async function testAIGeneration(button) {
  const originalText = button.textContent;
  
  try {
    button.disabled = true;
    button.textContent = '⏳ Testing Connection...';
    button.style.background = '#666';

    console.log('[Kajabi AI Test] ═══════════════════════════════════════');
    console.log('[Kajabi AI Test] 🤖 STARTING AI TEST');
    console.log('[Kajabi AI Test] ═══════════════════════════════════════');

    const connectionTest = await OpenRouterService.testConnection();
    
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    console.log('[Kajabi AI Test] ✅ Connection successful!');
    
    button.textContent = '🧠 Generating Description...';
    
    const titleField = document.querySelector('#blog_post_title') || 
                      document.querySelector('input[name="blog_post[title]"]');
    
    if (!titleField || !titleField.value) {
      alert('❌ Please enter a blog title first!');
      throw new Error('No title found in title field');
    }

    const title = titleField.value;
    console.log('[Kajabi AI Test] Using title:', title);

    const description = await OpenRouterService.generatePageDescription(title);
    console.log('[Kajabi AI Test] ✅ Description generated:', description);

    button.textContent = '🖼️ Generating Alt Text...';
    
    const altText = await OpenRouterService.generateImageAltText(title);
    console.log('[Kajabi AI Test] ✅ Alt text generated:', altText);

    const pageDescField = document.querySelector('#blog_post_page_description') || 
                         document.querySelector('textarea[name="blog_post[page_description]"]');
    if (pageDescField) {
      pageDescField.value = description;
      pageDescField.dispatchEvent(new Event('input', { bubbles: true }));
      pageDescField.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Kajabi AI Test] ✅ Description filled into field');
    }

    const imageAltField = document.querySelector('#blog_post_image_alt_text') || 
                         document.querySelector('input[name="blog_post[image_alt_text]"]');
    if (imageAltField) {
      imageAltField.value = altText;
      imageAltField.dispatchEvent(new Event('input', { bubbles: true }));
      imageAltField.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Kajabi AI Test] ✅ Alt text filled into field');
    }

    button.textContent = '✅ Success!';
    button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';

    console.log('[Kajabi AI Test] ═══════════════════════════════════════');
    console.log('[Kajabi AI Test] ✅ AI TEST COMPLETE');
    console.log('[Kajabi AI Test] Description:', description);
    console.log('[Kajabi AI Test] Alt Text:', altText);
    console.log('[Kajabi AI Test] ═══════════════════════════════════════');

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.disabled = false;
    }, 3000);

  } catch (error) {
    console.error('[Kajabi AI Test] ❌ Test failed:', error);
    
    button.textContent = '❌ Failed';
    button.style.background = '#e53e3e';

    alert(`AI Test Failed:\n${error.message}\n\nCheck console for details.`);

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      button.disabled = false;
    }, 3000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAITestButton);
} else {
  injectAITestButton();
}

setTimeout(() => {
  if (!document.getElementById('kajabi-ai-test-btn')) {
    injectAITestButton();
  }
}, 2000);

