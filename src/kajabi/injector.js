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

