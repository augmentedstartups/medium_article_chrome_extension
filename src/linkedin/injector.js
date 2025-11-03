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

  await RetryHandler.delay(500);

  const editor = await LinkedInDOM.waitForEditor();
  console.log('[LinkedIn Injector] ✓ Editor found');
  
  await RetryHandler.delay(500);
  
  const htmlContent = buildHTMLContent(article);
  console.log('[LinkedIn Injector] Built HTML content, length:', htmlContent.length);

  let contentInserted = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!contentInserted && attempts < maxAttempts) {
    attempts++;
    console.log(`[LinkedIn Injector] Content insertion attempt ${attempts}/${maxAttempts}`);

    editor.focus();
    await RetryHandler.delay(300);

    try {
      const success = document.execCommand('insertHTML', false, htmlContent);
      console.log('[LinkedIn Injector] execCommand insertHTML result:', success);
    } catch (e) {
      console.warn('[LinkedIn Injector] execCommand failed:', e);
    }

    await RetryHandler.delay(500);

    let currentContent = editor.innerHTML || editor.textContent || '';
    console.log('[LinkedIn Injector] Content length after attempt:', currentContent.length);

    if (currentContent.trim().length < 100) {
      console.log('[LinkedIn Injector] Content too short, trying direct innerHTML...');
      editor.innerHTML = htmlContent;
      
      const inputEvent = new Event('input', { bubbles: true });
      editor.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true });
      editor.dispatchEvent(changeEvent);
      
      await RetryHandler.delay(500);
      currentContent = editor.innerHTML || editor.textContent || '';
    }

    if (currentContent.trim().length >= 100) {
      contentInserted = true;
      console.log('[LinkedIn Injector] ✓ Content successfully inserted');
    } else if (attempts < maxAttempts) {
      console.warn('[LinkedIn Injector] Content still empty, waiting 1s before retry...');
      await RetryHandler.delay(1000);
    }
  }

  if (!contentInserted) {
    throw new Error('Content injection failed after ' + maxAttempts + ' attempts - editor is still empty');
  }

  await RetryHandler.delay(1000);

  const finalContent = editor.innerHTML || editor.textContent;
  console.log('[LinkedIn Injector] Final editor content length:', finalContent.length);

  const verification = await RetryHandler.verifyImagesLoaded(editor);
  console.log('[LinkedIn Injector] Image verification:', verification);
  
  if (!verification.allLoaded && verification.total > 0) {
    console.warn('[LinkedIn Injector] Not all images loaded, but continuing...');
  }

  let coverImageUploaded = false;
  if (article.images && article.images.length > 0) {
    console.log('[LinkedIn Injector] Attempting to upload cover image...');
    try {
      await uploadCoverImage(article.images[0]);
      coverImageUploaded = true;
      console.log('[LinkedIn Injector] ✓ Cover image uploaded');
    } catch (error) {
      console.error('[LinkedIn Injector] Failed to upload cover image:', error);
    }
  }

  console.log('[LinkedIn Injector] ✓ Injection complete');

  return {
    title: article.title,
    contentBlocks: article.content.length,
    imagesInjected: article.images.length,
    imagesVerified: verification,
    coverImageUploaded: coverImageUploaded,
    finalContentLength: finalContent.length,
    insertionAttempts: attempts
  };
}

async function uploadCoverImage(image) {
  await RetryHandler.delay(1000);

  const uploadButton = await LinkedInDOM.findCoverUploadButton();
  console.log('[LinkedIn Injector] Found upload button:', uploadButton);

  uploadButton.click();
  console.log('[LinkedIn Injector] Clicked upload button');

  await RetryHandler.delay(500);

  const fileInput = await LinkedInDOM.waitForFileInput();
  console.log('[LinkedIn Injector] Found file input:', fileInput);

  const file = await LinkedInDOM.dataURLtoFile(image.dataURL, 'cover-image.jpg');
  console.log('[LinkedIn Injector] Created file object:', file.name, file.size, 'bytes');

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  const changeEvent = new Event('change', { bubbles: true });
  fileInput.dispatchEvent(changeEvent);

  const inputEvent = new Event('input', { bubbles: true });
  fileInput.dispatchEvent(inputEvent);

  await RetryHandler.delay(2000);

  console.log('[LinkedIn Injector] Waiting for Next button...');
  
  try {
    const nextButton = await LinkedInDOM.waitForNextButton();
    console.log('[LinkedIn Injector] Found Next button:', nextButton);
    
    nextButton.click();
    console.log('[LinkedIn Injector] ✓ Clicked Next button');
    
    await RetryHandler.delay(1000);
  } catch (error) {
    console.warn('[LinkedIn Injector] Next button not found or not needed:', error);
  }

  console.log('[LinkedIn Injector] Cover image upload complete');
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

