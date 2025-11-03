chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectToKajabi') {
    injectArticleToKajabi(message.data.article)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function injectArticleToKajabi(article) {
  console.log('[Kajabi Injector] ═══════════════════════════════════════');
  console.log('[Kajabi Injector] 🚀 STARTING KAJABI INJECTION');
  console.log('[Kajabi Injector] ═══════════════════════════════════════');
  console.log('[Kajabi Injector] Article:', {
    title: article.title,
    contentBlocks: article.content.length,
    images: article.images.length
  });

  const titleField = await KajabiDOM.waitForTitleField();
  KajabiDOM.setInputValue(titleField, article.title);
  console.log('[Kajabi Injector] ✅ Title injected:', article.title);

  await KajabiDOM.delay(500);

  const editorBody = await KajabiDOM.waitForTinyMCE();
  console.log('[Kajabi Injector] ✅ TinyMCE editor found');

  console.log('[Kajabi Injector] ───────────────────────────────────────');
  console.log('[Kajabi Injector] 📝 INSERTING TEXT + IMAGES SEQUENTIALLY');
  console.log('[Kajabi Injector] ───────────────────────────────────────');

  if (article.subtitle) {
    editorBody.innerHTML += `<h2>${escapeHTML(article.subtitle)}</h2>`;
    console.log('[Kajabi Injector] ✅ Subtitle added');
    await KajabiDOM.delay(100);
  }

  let imageCount = 0;
  let uploadedImages = 0;
  let blockNumber = 0;
  let isFirstImage = true;

  for (const block of article.content) {
    blockNumber++;
    console.log(`[Kajabi Injector] Block ${blockNumber}/${article.content.length}: ${block.type}`);

    if (block.type === 'p' || block.type.startsWith('h') || block.type === 'blockquote' || block.type === 'quote') {
      await insertTextBlock(editorBody, block);
    } else if (block.type === 'ul' || block.type === 'ol') {
      await insertListBlock(editorBody, block);
    } else if (block.type === 'code') {
      await insertCodeBlock(editorBody, block);
    } else if (block.type === 'image') {
      imageCount++;
      
      if (isFirstImage) {
        console.log(`[Kajabi Injector] → ⏭️  Skipping first image (will be used elsewhere)`);
        isFirstImage = false;
        continue;
      }
      
      console.log(`[Kajabi Injector] → 🖼️ Uploading image ${imageCount}...`);
      
      const success = await KajabiImageUploader.uploadImage(block, imageCount - 1, editorBody);
      if (success) {
        uploadedImages++;
        console.log(`[Kajabi Injector] → ✅ Image ${imageCount} uploaded`);
      } else {
        console.log(`[Kajabi Injector] → ⚠️ Image ${imageCount} failed, adding placeholder`);
        await insertImagePlaceholder(editorBody, block);
      }
      
      await KajabiDOM.delay(800);
    }
  }

  const iframe = document.querySelector('#blog_post_content_ifr');
  if (iframe && iframe.contentWindow) {
    const style = iframe.contentDocument.createElement('style');
    style.textContent = 'a { color: #A08FFF !important; }';
    iframe.contentDocument.head.appendChild(style);
    iframe.contentWindow.focus();
  }

  await KajabiDOM.delay(500);

  if (article.images && article.images.length > 0 && article.images[0].dataURL) {
    console.log('[Kajabi Injector] 📸 Uploading first image to social image slots...');
    try {
      await uploadSocialImages(article.images[0]);
      console.log('[Kajabi Injector] ✅ Social images uploaded');
    } catch (error) {
      console.error('[Kajabi Injector] ⚠️ Social image upload failed:', error);
    }
  } else {
    console.log('[Kajabi Injector] ⏭️ No first image available for social image upload');
  }

  await fillKajabiMetadata(article);
  console.log('[Kajabi Injector] ✅ Metadata fields filled');

  console.log('[Kajabi Injector] ═══════════════════════════════════════');
  console.log('[Kajabi Injector] ✅ ✅ KAJABI INJECTION COMPLETE ✅ ✅');
  console.log('[Kajabi Injector] Total blocks:', blockNumber);
  console.log('[Kajabi Injector] Images uploaded:', uploadedImages);
  console.log('[Kajabi Injector] ═══════════════════════════════════════');

  return {
    title: article.title,
    contentBlocks: article.content.length,
    imagesUploaded: uploadedImages
  };
}

async function insertTextBlock(editorBody, block) {
  let html = '';
  
  switch (block.type) {
    case 'h1':
      html = `<h1>${block.content}</h1>`;
      break;
    case 'h2':
      html = `<h2>${block.content}</h2>`;
      break;
    case 'h3':
      html = `<h3>${block.content}</h3>`;
      break;
    case 'h4':
      html = `<h4>${block.content}</h4>`;
      break;
    case 'p':
      html = `<p>${block.content}</p>`;
      break;
    case 'blockquote':
    case 'quote':
      html = `<blockquote><p>${block.content}</p></blockquote>`;
      break;
  }
  
  editorBody.innerHTML += html;
  await KajabiDOM.delay(100);
  
  await ensureCursorAtEnd();
}

async function insertListBlock(editorBody, block) {
  const listType = block.type === 'ul' ? 'ul' : 'ol';
  let html = `<${listType}>`;
  block.items.forEach(item => {
    html += `<li>${escapeHTML(item)}</li>`;
  });
  html += `</${listType}>`;
  
  editorBody.innerHTML += html;
  await KajabiDOM.delay(100);
  
  await ensureCursorAtEnd();
}

async function insertCodeBlock(editorBody, block) {
  const html = `<blockquote><p><em>${block.content}</em></p></blockquote>`;
  editorBody.innerHTML += html;
  await KajabiDOM.delay(100);
  
  await ensureCursorAtEnd();
}

async function insertImagePlaceholder(editorBody, block) {
  const html = `<p><em>[Image: ${escapeHTML(block.alt || 'Image')}]</em></p>`;
  editorBody.innerHTML += html;
  await KajabiDOM.delay(100);
}


async function ensureCursorAtEnd() {
  const iframe = document.querySelector('#blog_post_content_ifr');
  if (!iframe || !iframe.contentWindow) {
    console.log('[Kajabi Injector] Cannot find iframe for cursor positioning');
    return;
  }
  
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const body = iframeDoc.body;
    
    body.click();
    await KajabiDOM.delay(50);
    
    const range = iframeDoc.createRange();
    range.selectNodeContents(body);
    range.collapse(false);
    
    const selection = iframe.contentWindow.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    body.focus();
    
    console.log('[Kajabi Injector] ✓ Cursor positioned at end');
  } catch (error) {
    console.error('[Kajabi Injector] Failed to position cursor:', error);
  }
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function uploadSocialImages(imageData) {
  console.log('[Kajabi Injector] Starting social image uploads...');
  
  try {
    await uploadToSocialImageSlot(imageData, 1);
    await uploadToSocialImageSlot(imageData, 2);
    console.log('[Kajabi Injector] ✅ Both social images uploaded successfully');
  } catch (error) {
    console.error('[Kajabi Injector] Social image upload failed:', error);
    throw error;
  }
}

async function uploadToSocialImageSlot(imageData, slotNumber) {
  console.log(`[Kajabi Injector] Uploading to social image slot ${slotNumber}...`);
  
  const dropdownButtons = document.querySelectorAll('button[data-sage-upload-card-target="dropdownTrigger"]');
  
  if (dropdownButtons.length < slotNumber) {
    throw new Error(`Social image slot ${slotNumber} not found`);
  }

  const dropdownButton = dropdownButtons[slotNumber - 1];
  dropdownButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await KajabiDOM.delay(300);
  
  dropdownButton.click();
  await KajabiDOM.delay(800);

  let uploadLink = null;
  const allLinks = document.querySelectorAll('a.sage-dropdown__item-control, a.fp-input');
  
  for (const link of allLinks) {
    if (link.textContent.includes('Upload') && link.offsetParent !== null) {
      uploadLink = link;
      break;
    }
  }
  
  if (!uploadLink) {
    const fpInputs = document.querySelectorAll('.fp-input');
    for (const input of fpInputs) {
      if (input.offsetParent !== null) {
        uploadLink = input;
        break;
      }
    }
  }
  
  if (!uploadLink) {
    throw new Error(`Upload link ${slotNumber} not found`);
  }
  
  uploadLink.click();
  await KajabiDOM.delay(1500);

  const fileInput = await waitForFileInputForSocial();
  
  const file = await dataURLtoFileForSocial(imageData.dataURL, `social-image-${slotNumber}.jpg`);
  console.log(`[Kajabi Injector] Created file for slot ${slotNumber}:`, file.size, 'bytes');

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  fileInput.dispatchEvent(new Event('input', { bubbles: true }));

  await KajabiDOM.delay(1500);
  
  const uploadButton = await waitForUploadButtonForSocial();
  uploadButton.click();
  console.log(`[Kajabi Injector] Clicked upload button for slot ${slotNumber}`);
  
  await KajabiDOM.delay(2000);
  
  const saveButton = await waitForSaveButtonForSocial();
  saveButton.click();
  console.log(`[Kajabi Injector] Clicked save button for slot ${slotNumber}`);
  
  await waitForModalCloseForSocial();
  await KajabiDOM.delay(1000);
  
  console.log(`[Kajabi Injector] ✅ Social image slot ${slotNumber} complete`);
}

async function waitForFileInputForSocial(timeout = 8000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const inputs = document.querySelectorAll('input[type="file"]');
    
    for (const input of inputs) {
      if (input.offsetParent !== null || input.style.display !== 'none') {
        return input;
      }
    }
    
    if (inputs.length > 0) {
      return inputs[inputs.length - 1];
    }
    
    await KajabiDOM.delay(200);
  }
  
  throw new Error('File input did not appear for social image');
}

async function waitForUploadButtonForSocial(timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const uploadButtons = document.querySelectorAll('button.uppy-StatusBar-actionBtn--upload, button[aria-label*="Upload"]');
    
    for (const button of uploadButtons) {
      if ((button.textContent.includes('Upload') && button.textContent.includes('file')) && button.offsetParent !== null) {
        return button;
      }
    }
    
    await KajabiDOM.delay(200);
  }
  
  throw new Error('Upload button did not appear');
}

async function waitForSaveButtonForSocial(timeout = 8000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const saveButtons = document.querySelectorAll('button.uppy-DashboardContent-save, button[type="button"]');
    
    for (const button of saveButtons) {
      if (button.textContent.includes('Save') && button.offsetParent !== null) {
        return button;
      }
    }
    
    await KajabiDOM.delay(200);
  }
  
  throw new Error('Save button did not appear');
}

async function waitForModalCloseForSocial(timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const modals = document.querySelectorAll('.uppy-Dashboard, [role="dialog"]');
    const visibleModals = Array.from(modals).filter(m => m.offsetParent !== null);
    
    if (visibleModals.length === 0) {
      return true;
    }
    
    await KajabiDOM.delay(200);
  }
  
  return false;
}

async function dataURLtoFileForSocial(dataURL, filename) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

async function fillKajabiMetadata(article) {
  const slug = article.title
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_-]/g, '');
  
  const slugField = document.querySelector('#blog_post\\[slug\\]') || 
                   document.querySelector('input[name="blog_post[slug]"]');
  if (slugField) {
    slugField.value = slug;
    slugField.dispatchEvent(new Event('input', { bubbles: true }));
    slugField.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[Kajabi Injector] Filled slug field:', slug);
  }

  const pageTitleField = document.querySelector('#blog_post_page_title') || 
                        document.querySelector('input[name="blog_post[page_title]"]');
  if (pageTitleField) {
    pageTitleField.value = article.title;
    pageTitleField.dispatchEvent(new Event('input', { bubbles: true }));
    pageTitleField.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[Kajabi Injector] Filled page title field with article title:', article.title);
  }

  console.log('[Kajabi Injector] 🤖 Generating AI-powered SEO content...');
  
  try {
    const articleContentText = article.content
      .filter(block => block.type === 'p' || block.type.startsWith('h'))
      .map(block => block.content)
      .join(' ');

    const description = await OpenRouterService.generatePageDescription(
      article.title, 
      article.subtitle || '', 
      articleContentText
    );
    
    const pageDescField = document.querySelector('#blog_post_page_description') || 
                         document.querySelector('textarea[name="blog_post[page_description]"]');
    if (pageDescField) {
      pageDescField.value = description;
      pageDescField.dispatchEvent(new Event('input', { bubbles: true }));
      pageDescField.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Kajabi Injector] ✅ AI-generated description:', description);
    }

    const altText = await OpenRouterService.generateImageAltText(article.title);
    
    const imageAltField = document.querySelector('#blog_post_image_alt_text') || 
                         document.querySelector('input[name="blog_post[image_alt_text]"]');
    if (imageAltField) {
      imageAltField.value = altText;
      imageAltField.dispatchEvent(new Event('input', { bubbles: true }));
      imageAltField.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Kajabi Injector] ✅ AI-generated alt text:', altText);
    }
    
  } catch (error) {
    console.error('[Kajabi Injector] ⚠️ AI generation failed, using fallbacks:', error);
    
    if (error.message.includes('401') || error.message.includes('User not found')) {
      alert('❌ OpenRouter API Key Invalid!\n\nYour OpenRouter API key is not working (401 error).\n\nPlease:\n1. Go to https://openrouter.ai/keys\n2. Generate a new API key\n3. Click the ⚙️ settings button to update it\n\nUsing fallback text for now.');
    }
    
    const pageDescField = document.querySelector('#blog_post_page_description') || 
                         document.querySelector('textarea[name="blog_post[page_description]"]');
    if (pageDescField && !pageDescField.value) {
      pageDescField.value = article.subtitle || article.title;
      pageDescField.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[Kajabi Injector] Using subtitle as fallback description');
    }

    const imageAltField = document.querySelector('#blog_post_image_alt_text') || 
                         document.querySelector('input[name="blog_post[image_alt_text]"]');
    if (imageAltField && !imageAltField.value) {
      imageAltField.value = `Featured image for ${article.title}`;
      imageAltField.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[Kajabi Injector] Using title-based fallback alt text');
    }
  }
}

