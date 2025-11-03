console.log('[Test Button] Script loaded');

function injectTestButton() {
  if (document.getElementById('linkedin-test-inject-btn')) {
    console.log('[Test Button] Button already exists');
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'linkedin-test-inject-btn';
  button.textContent = '🧪 Insert Test Article';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
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
    console.log('[Test Button] Button clicked');
    button.disabled = true;
    button.textContent = '⏳ Inserting...';
    
    try {
      const testArticle = await TestData.getTestArticle();
      console.log('[Test Button] Test article prepared:', testArticle);
      
      await injectTestArticleDirectly(testArticle);
      
      button.textContent = '✅ Inserted!';
      button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      
      setTimeout(() => {
        button.textContent = '🧪 Insert Test Article';
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        button.disabled = false;
      }, 3000);
      
    } catch (error) {
      console.error('[Test Button] Insertion failed:', error);
      button.textContent = '❌ Failed';
      button.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
      
      setTimeout(() => {
        button.textContent = '🧪 Insert Test Article';
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        button.disabled = false;
      }, 3000);
    }
  });
  
  document.body.appendChild(button);
  console.log('[Test Button] Button injected successfully');
}

async function injectTestArticleDirectly(article) {
  console.log('[Test Button] ═══════════════════════════════════════');
  console.log('[Test Button] 🚀 STARTING TEST INJECTION');
  console.log('[Test Button] ═══════════════════════════════════════');
  
  const titleField = await LinkedInDOM.waitForTitleField();
  LinkedInDOM.setInputValue(titleField, article.title);
  console.log('[Test Button] ✅ Title injected:', article.title);
  
  await RetryHandler.delay(Config.delays.titleToEditor);
  
  const editor = await LinkedInDOM.waitForEditor();
  console.log('[Test Button] ✅ Editor found');
  
  await RetryHandler.delay(Config.delays.editorReady);
  
  console.log('[Test Button] Using FILE_UPLOAD strategy');
  const bodyResult = await FileUploadStrategy.inject(editor, article);
  
  console.log('[Test Button] ───────────────────────────────────────');
  console.log('[Test Button] ✅ Body content injection complete');
  console.log('[Test Button] Result:', bodyResult);
  console.log('[Test Button] ───────────────────────────────────────');
  
  console.log('[Test Button] 🖼️  Uploading cover image...');
  if (article.images && article.images.length > 0) {
    try {
      await uploadCoverImageTest(article.images[0]);
      console.log('[Test Button] ✅ Cover image uploaded');
    } catch (error) {
      console.error('[Test Button] ❌ Cover image upload failed:', error);
    }
  }
  
  console.log('[Test Button] ═══════════════════════════════════════');
  console.log('[Test Button] ✅ ✅ TEST INJECTION COMPLETE ✅ ✅');
  console.log('[Test Button] ═══════════════════════════════════════');
}

async function uploadCoverImageTest(image) {
  await RetryHandler.delay(Config.delays.beforeCoverUpload);
  
  const uploadButton = await LinkedInDOM.findCoverUploadButton();
  console.log('[Test Button] Found upload button:', uploadButton);
  
  uploadButton.click();
  console.log('[Test Button] Clicked upload button');
  
  await RetryHandler.delay(Config.delays.afterButtonClick);
  
  const fileInput = await LinkedInDOM.waitForFileInput();
  console.log('[Test Button] Found file input:', fileInput);
  
  const file = await LinkedInDOM.dataURLtoFile(image.dataURL, 'cover-image.jpg');
  console.log('[Test Button] Created file object:', file.name, file.size, 'bytes');
  
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  
  const changeEvent = new Event('change', { bubbles: true });
  fileInput.dispatchEvent(changeEvent);
  
  const inputEvent = new Event('input', { bubbles: true });
  fileInput.dispatchEvent(inputEvent);
  
  await RetryHandler.delay(Config.delays.afterFileUpload);
  
  console.log('[Test Button] Waiting for Next button...');
  
  try {
    const nextButton = await LinkedInDOM.waitForNextButton();
    console.log('[Test Button] Found Next button:', nextButton);
    
    nextButton.click();
    console.log('[Test Button] ✓ Clicked Next button');
    
    await RetryHandler.delay(Config.delays.afterNextButton);
  } catch (error) {
    console.warn('[Test Button] Next button not found or not needed:', error);
  }
  
  console.log('[Test Button] Cover image upload complete');
}

if (window.location.href.includes('linkedin.com')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTestButton);
  } else {
    injectTestButton();
  }
  
  const observer = new MutationObserver(() => {
    if (window.location.href.includes('/post/new') || 
        window.location.href.includes('/article/new') ||
        window.location.href.includes('/article/edit')) {
      injectTestButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

