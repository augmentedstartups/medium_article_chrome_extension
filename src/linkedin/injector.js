chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectArticle') {
    injectArticleToLinkedIn(message.data.article)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function injectArticleToLinkedIn(article) {
  console.log('[LinkedIn Injector] Starting injection...');
  console.log('[LinkedIn Injector] Article:', {
    title: article.title,
    contentBlocks: article.content.length,
    images: article.images.length
  });

  const result = await RetryHandler.executeWithRetry(
    async () => await performInjection(article),
    'LinkedIn article injection'
  );

  if (!result.success) {
    throw new Error(`Injection failed after ${result.attempts} attempts: ${result.error}`);
  }

  return result;
}

async function performInjection(article) {
  console.log('[LinkedIn Injector] Starting injection process...');
  
  const titleField = await LinkedInDOM.waitForTitleField();
  LinkedInDOM.setInputValue(titleField, article.title);
  console.log('[LinkedIn Injector] ✓ Title injected:', article.title);

  await RetryHandler.delay(300);

  const editor = await LinkedInDOM.waitForEditor();
  console.log('[LinkedIn Injector] ✓ Editor found');
  
  const htmlContent = buildHTMLContent(article);
  console.log('[LinkedIn Injector] Built HTML content, length:', htmlContent.length);

  editor.focus();
  await RetryHandler.delay(200);

  try {
    const success = document.execCommand('insertHTML', false, htmlContent);
    console.log('[LinkedIn Injector] execCommand insertHTML result:', success);
  } catch (e) {
    console.warn('[LinkedIn Injector] execCommand failed, trying innerHTML method:', e);
  }

  await RetryHandler.delay(300);

  if (editor.innerHTML.trim().length < 100) {
    console.log('[LinkedIn Injector] Content too short, trying direct innerHTML...');
    editor.innerHTML = htmlContent;
    
    const inputEvent = new Event('input', { bubbles: true });
    editor.dispatchEvent(inputEvent);
  }
  
  await RetryHandler.delay(1000);

  const currentContent = editor.innerHTML || editor.textContent;
  console.log('[LinkedIn Injector] Current editor content length:', currentContent.length);

  if (currentContent.length < 100) {
    throw new Error('Content injection failed - editor is empty');
  }

  const verification = await RetryHandler.verifyImagesLoaded(editor);
  console.log('[LinkedIn Injector] Image verification:', verification);
  
  if (!verification.allLoaded && verification.total > 0) {
    console.warn('[LinkedIn Injector] Not all images loaded, but continuing...');
  }

  console.log('[LinkedIn Injector] ✓ Injection complete');

  return {
    title: article.title,
    contentBlocks: article.content.length,
    imagesInjected: article.images.length,
    imagesVerified: verification,
    finalContentLength: currentContent.length
  };
}

function buildHTMLContent(article) {
  let html = '';

  if (article.subtitle) {
    html += `<h2>${article.subtitle}</h2>`;
  }

  for (const block of article.content) {
    switch (block.type) {
      case 'h1':
        html += `<h1>${block.content}</h1>`;
        break;
      case 'h2':
        html += `<h2>${block.content}</h2>`;
        break;
      case 'h3':
        html += `<h3>${block.content}</h3>`;
        break;
      case 'p':
        html += `<p>${block.content}</p>`;
        break;
      case 'image':
        html += `<img src="${block.dataURL}" alt="${block.alt || ''}" style="max-width: 100%; height: auto;">`;
        if (block.caption && block.caption.trim()) {
          html += `<p><em>${block.caption}</em></p>`;
        }
        break;
      case 'ul':
        html += '<ul>';
        block.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ul>';
        break;
      case 'ol':
        html += '<ol>';
        block.items.forEach(item => {
          html += `<li>${item}</li>`;
        });
        html += '</ol>';
        break;
      case 'quote':
        html += `<blockquote>${block.content}</blockquote>`;
        break;
      case 'code':
        html += `<pre><code>${block.content}</code></pre>`;
        break;
    }
  }

  const ctaImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
  html += `<br><img src="${ctaImageURL}" alt="AI Automation Audit Call-to-Action" style="max-width: 100%; height: auto;">`;

  console.log('[LinkedIn Injector] Added CTA image:', ctaImageURL);

  return html;
}

