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

  const htmlContent = buildKajabiHTML(article);
  console.log('[Kajabi Injector] Built HTML, length:', htmlContent.length);

  editorBody.innerHTML = htmlContent;
  console.log('[Kajabi Injector] ✅ Content pasted to TinyMCE');

  const iframe = document.querySelector('#blog_post_content_ifr');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.focus();
  }

  await KajabiDOM.delay(500);

  console.log('[Kajabi Injector] ═══════════════════════════════════════');
  console.log('[Kajabi Injector] ✅ ✅ KAJABI INJECTION COMPLETE ✅ ✅');
  console.log('[Kajabi Injector] ═══════════════════════════════════════');

  return {
    title: article.title,
    contentBlocks: article.content.length,
    contentLength: htmlContent.length
  };
}

function buildKajabiHTML(article) {
  let html = '';

  if (article.subtitle) {
    html += `<h2>${escapeHTML(article.subtitle)}</h2>`;
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
      case 'h4':
        html += `<h4>${block.content}</h4>`;
        break;
      case 'p':
        html += `<p>${block.content}</p>`;
        break;
      case 'blockquote':
      case 'quote':
        html += `<blockquote><p>${block.content}</p></blockquote>`;
        break;
      case 'ul':
        html += '<ul>';
        block.items.forEach(item => {
          html += `<li>${escapeHTML(item)}</li>`;
        });
        html += '</ul>';
        break;
      case 'ol':
        html += '<ol>';
        block.items.forEach(item => {
          html += `<li>${escapeHTML(item)}</li>`;
        });
        html += '</ol>';
        break;
      case 'image':
        if (block.dataURL) {
          html += `<p><img src="${block.dataURL}" alt="${escapeHTML(block.alt || '')}" style="max-width: 100%; height: auto;" /></p>`;
          if (block.caption) {
            html += `<p><em>${escapeHTML(block.caption)}</em></p>`;
          }
        }
        break;
      case 'code':
        html += `<blockquote><p><em>${block.content}</em></p></blockquote>`;
        break;
    }
  }

  console.log('[Kajabi Injector] Built HTML with', article.content.length, 'blocks');
  
  return html;
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

