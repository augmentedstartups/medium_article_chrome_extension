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
  
  if (message.action === 'retryBodyOnly') {
    retryBodyPasteOnly(message.data.article)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function retryBodyPasteOnly(article) {
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  console.log('[LinkedIn Injector] 🔄 MANUAL BODY RETRY STARTED');
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  
  const editor = await LinkedInDOM.waitForEditor();
  console.log('[LinkedIn Injector] ✅ Editor found');
  
  const htmlContent = buildHTMLContent(article, true);
  console.log('[LinkedIn Injector] Built HTML content, length:', htmlContent.length);
  
  console.log('[LinkedIn Injector] Clearing existing content...');
  editor.innerHTML = '';
  await RetryHandler.delay(300);
  
  let contentInserted = false;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (!contentInserted && attempts < maxAttempts) {
    attempts++;
    console.log(`[LinkedIn Injector] 🔄 MANUAL RETRY ATTEMPT ${attempts}/${maxAttempts}`);
    
    editor.focus();
    await RetryHandler.delay(200);
    
    editor.innerHTML = htmlContent;
    
    const inputEvent = new Event('input', { bubbles: true });
    editor.dispatchEvent(inputEvent);
    
    const changeEvent = new Event('change', { bubbles: true });
    editor.dispatchEvent(changeEvent);
    
    await RetryHandler.delay(500);
    
    const currentContent = editor.innerHTML || editor.textContent || '';
    const currentLength = currentContent.trim().length;
    console.log('[LinkedIn Injector] Content check - Length:', currentLength, 'chars');
    
    if (currentLength >= 100) {
      contentInserted = true;
      console.log('[LinkedIn Injector] ✅ ✅ MANUAL RETRY SUCCESSFUL');
      console.log('[LinkedIn Injector] Final length:', currentLength, 'chars');
    } else if (attempts < maxAttempts) {
      console.error('[LinkedIn Injector] ❌ Manual attempt failed - Content still empty');
      await RetryHandler.delay(1000);
    }
  }
  
  if (!contentInserted) {
    console.error('[LinkedIn Injector] ❌ MANUAL RETRY FAILED after', maxAttempts, 'attempts');
    throw new Error('Manual retry failed after ' + maxAttempts + ' attempts');
  }
  
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  console.log('[LinkedIn Injector] ✅ ✅ MANUAL RETRY COMPLETE ✅ ✅');
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  
  return {
    success: true,
    attempts: attempts,
    contentLength: editor.innerHTML.length
  };
}

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
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  console.log('[LinkedIn Injector] 🚀 STARTING INJECTION PROCESS');
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  
  const { imageStrategy } = await chrome.storage.sync.get(['imageStrategy']);
  const strategy = imageStrategy || 'CLIPBOARD_API';
  
  console.log('[LinkedIn Injector] 📌 Selected Strategy:', strategy);
  
  const titleField = await LinkedInDOM.waitForTitleField();
  LinkedInDOM.setInputValue(titleField, article.title);
  console.log('[LinkedIn Injector] ✅ Title injected:', article.title);

  await RetryHandler.delay(Config.delays.titleToEditor);

  const editor = await LinkedInDOM.waitForEditor();
  console.log('[LinkedIn Injector] ✅ Editor found');
  
  await RetryHandler.delay(Config.delays.editorReady);
  
  let bodyResult;
  
  try {
    switch(strategy) {
      case 'CLIPBOARD_API':
        console.log('[LinkedIn Injector] Using Clipboard API Strategy');
        bodyResult = await ClipboardAPIStrategy.inject(editor, article);
        break;
      case 'FILE_UPLOAD':
        console.log('[LinkedIn Injector] Using File Upload Strategy');
        bodyResult = await FileUploadStrategy.inject(editor, article);
        break;
      case 'USER_PASTE':
        console.log('[LinkedIn Injector] Using User Paste Strategy');
        bodyResult = await UserPasteStrategy.inject(editor, article);
        break;
      case 'PROSEMIRROR':
        console.log('[LinkedIn Injector] Using ProseMirror Strategy');
        bodyResult = await ProseMirrorStrategy.inject(editor, article);
        break;
      default:
        throw new Error('Unknown strategy: ' + strategy);
    }
  } catch (error) {
    console.error('[LinkedIn Injector] Strategy failed:', error);
    throw error;
  }
  
  console.log('[LinkedIn Injector] ───────────────────────────────────────');
  console.log('[LinkedIn Injector] ✅ PHASE 1 COMPLETE: BODY CONTENT INJECTED');
  console.log('[LinkedIn Injector] Strategy:', strategy);
  console.log('[LinkedIn Injector] Result:', bodyResult);
  console.log('[LinkedIn Injector] ───────────────────────────────────────');

  console.log('[LinkedIn Injector] ───────────────────────────────────────');
  console.log('[LinkedIn Injector] 🖼️  PHASE 2: UPLOAD COVER IMAGE');
  console.log('[LinkedIn Injector] ───────────────────────────────────────');

  let coverImageUploaded = false;

  if (article.images && article.images.length > 0) {
    console.log('[LinkedIn Injector] Attempting to upload cover image...');
    console.log('[LinkedIn Injector] Image source:', article.images[0].original);
    try {
      await uploadCoverImage(article.images[0]);
      coverImageUploaded = true;
      console.log('[LinkedIn Injector] ✅ Cover image uploaded successfully');
    } catch (error) {
      console.error('[LinkedIn Injector] ❌ Failed to upload cover image:', error);
    }
  } else {
    console.log('[LinkedIn Injector] ⚠️  No images available for cover upload');
  }

  await RetryHandler.delay(500);
  const finalContent = editor.innerHTML || editor.textContent;
  const verification = await RetryHandler.verifyImagesLoaded(editor);
  
  console.log('[LinkedIn Injector] ───────────────────────────────────────');
  console.log('[LinkedIn Injector] 📊 FINAL VERIFICATION');
  console.log('[LinkedIn Injector] ───────────────────────────────────────');
  console.log('[LinkedIn Injector] Body images loaded:', verification.loaded);
  console.log('[LinkedIn Injector] Body images failed:', verification.failed);
  console.log('[LinkedIn Injector] Final content length:', finalContent.length, 'chars');
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');
  console.log('[LinkedIn Injector] ✅ ✅ INJECTION COMPLETE ✅ ✅');
  console.log('[LinkedIn Injector] ═══════════════════════════════════════');

  return {
    title: article.title,
    contentBlocks: article.content.length,
    imagesInjected: article.images.length,
    imagesVerified: verification,
    coverImageUploaded: coverImageUploaded,
    finalContentLength: finalContent.length,
    strategy: strategy,
    bodyResult: bodyResult
  };
}

async function uploadCoverImage(image) {
  await RetryHandler.delay(Config.delays.beforeCoverUpload);

  const uploadButton = await LinkedInDOM.findCoverUploadButton();
  console.log('[LinkedIn Injector] Found upload button:', uploadButton);

  uploadButton.click();
  console.log('[LinkedIn Injector] Clicked upload button');

  await RetryHandler.delay(Config.delays.afterButtonClick);

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

  await RetryHandler.delay(Config.delays.afterFileUpload);

  console.log('[LinkedIn Injector] Waiting for Next button...');
  
  try {
    const nextButton = await LinkedInDOM.waitForNextButton();
    console.log('[LinkedIn Injector] Found Next button:', nextButton);
    
    nextButton.click();
    console.log('[LinkedIn Injector] ✓ Clicked Next button');
    
    await RetryHandler.delay(Config.delays.afterNextButton);
  } catch (error) {
    console.warn('[LinkedIn Injector] Next button not found or not needed:', error);
  }

  console.log('[LinkedIn Injector] Cover image upload complete');
}

function buildHTMLContent(article, skipFirstImage = true) {
  const escapeHTML = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  let html = '';
  let imageCount = 0;

  console.log('[LinkedIn Injector] Building HTML, skipFirstImage:', skipFirstImage);

  if (article.subtitle) {
    html += `<p class="article-editor-paragraph"><strong>${escapeHTML(article.subtitle)}</strong></p>`;
  }

  for (const block of article.content) {
    switch (block.type) {
      case 'h1':
        html += `<p class="article-editor-paragraph"><strong>${escapeHTML(block.content)}</strong></p>`;
        break;
      case 'h2':
      case 'h3':
      case 'h4':
        html += `<p class="article-editor-paragraph"><strong>${escapeHTML(block.content)}</strong></p>`;
        break;
      case 'p':
        html += `<p class="article-editor-paragraph">${escapeHTML(block.content)}</p>`;
        break;
      case 'blockquote':
        html += `<blockquote class="article-editor-blockquote">${escapeHTML(block.content)}</blockquote>`;
        break;
      case 'ul':
        html += '<ul class="article-editor-list">';
        block.items.forEach(item => {
          html += `<li>${escapeHTML(item)}</li>`;
        });
        html += '</ul>';
        break;
      case 'ol':
        html += '<ol class="article-editor-list">';
        block.items.forEach(item => {
          html += `<li>${escapeHTML(item)}</li>`;
        });
        html += '</ol>';
        break;
      case 'image':
        imageCount++;

        if (skipFirstImage && imageCount === 1) {
          console.log('[LinkedIn Injector] ⏭️  Skipping first image (used as thumbnail)');
          continue;
        }

        const imageSrc = block.src || block.dataURL;
        const figureId = LinkedInDOM.generateNodeId('img-');
        const altText = escapeHTML(block.alt || '');
        const caption = escapeHTML(block.caption || '');
        const captionClass = caption ? '' : 'is-empty';

        console.log('[LinkedIn Injector] 📌 Using URL:', imageSrc.substring(0, 100));

        html += `
<figure class="article-editor-figure-image" data-id="${figureId}">
  <div class="article-editor-inline-image__container article-editor-inline-image__container--full-width" contenteditable="false">
    <div class="article-editor-content__element-overlay">
      <div class="article-editor-inline-image__buttons" data-test-inline-image-buttons="true">
        <button class="article-editor-content__button artdeco-button artdeco-button--1 artdeco-button--circle artdeco-button--inverse artdeco-button--secondary article-editor-inline-image__resize-button" aria-label="Minimize image" data-test-resize-image-button="true" type="button">
          <div class="resize-image-control-button-tooltip resize-image-control-button-tooltip--hidden">Minimize image</div>
          <svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" data-supported-dps="16x16" data-test-icon="minimize-small">
            <use href="#minimize-small" width="16" height="16"></use>
          </svg>
        </button>
        <button class="article-editor-content__button artdeco-button artdeco-button--1 artdeco-button--circle artdeco-button--inverse artdeco-button--secondary article-editor-inline-image__edit-button" aria-label="Edit image" data-test-edit-image-button="true" type="button">
          <div class="resize-image-control-button-tooltip resize-image-control-button-tooltip--hidden">Edit image</div>
          <svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" data-supported-dps="16x16" data-test-icon="edit-small">
            <use href="#edit-small" width="16" height="16"></use>
          </svg>
        </button>
        <button class="article-editor-content__button artdeco-button artdeco-button--1 artdeco-button--circle artdeco-button--inverse artdeco-button--secondary article-editor-inline-image__delete-button" aria-label="Delete image" data-test-delete-image-button="true" type="button">
          <div class="resize-image-control-button-tooltip resize-image-control-button-tooltip--hidden">Delete image</div>
          <svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" data-supported-dps="16x16" data-test-icon="trash-small">
            <use href="#trash-small" width="16" height="16"></use>
          </svg>
        </button>
      </div>
    </div>
    <img src="${imageSrc}" alt="${altText}" class="article-editor-inline-image__image">
  </div>
  <figcaption contenteditable="false" class="${captionClass}">
    <textarea class="article-editor-figure-caption" maxlength="250" data-test-inline-image-caption="true" placeholder="Add a caption (optional)" aria-label="Add a caption (optional)">${caption}</textarea>
  </figcaption>
</figure>
`;

        console.log('[LinkedIn Injector] ✅ Added image', imageCount, 'as figure block with controls');
        break;
      case 'code':
        html += `<pre class="article-editor-code-block"><code>${escapeHTML(block.content)}</code></pre>`;
        break;
    }
  }

  const ctaImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
  html += `
<figure class="article-editor-figure-image" data-id="${LinkedInDOM.generateNodeId('cta-')}">
  <div class="article-editor-inline-image__container article-editor-inline-image__container--full-width" contenteditable="false">
    <div class="article-editor-content__element-overlay">
      <div class="article-editor-inline-image__buttons" data-test-inline-image-buttons="true"></div>
    </div>
    <img src="${ctaImageURL}" alt="AI Automation Audit Call-to-Action" class="article-editor-inline-image__image">
  </div>
  <figcaption contenteditable="false" class="is-empty">
    <textarea class="article-editor-figure-caption" maxlength="250" data-test-inline-image-caption="true" placeholder="Add a caption (optional)" aria-label="Add a caption (optional)"></textarea>
  </figcaption>
</figure>
`;

  console.log('[LinkedIn Injector] Added CTA image figure block');

  return html;
}

