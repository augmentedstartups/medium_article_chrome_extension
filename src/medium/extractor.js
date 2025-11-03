chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractArticle') {
    extractMediumArticle()
      .then(article => {
        sendResponse({ success: true, article });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function extractMediumArticle() {
  console.log('[Medium Extractor] Starting extraction...');

  const article = {
    title: '',
    subtitle: '',
    content: [],
    images: [],
    metadata: {
      extractedAt: new Date().toISOString(),
      url: window.location.href
    }
  };

  const titleSelectors = [
    '[data-testid="editorTitleParagraph"]',
    '[data-testid="storyTitle"]',
    'h1[class*="title"]',
    'h3[class*="title"]',
    'h1.graf--title',
    'h3.graf--title',
    'h1',
    'article h1',
    'article h3.graf--title'
  ];
  
  let titleElement = null;
  for (const selector of titleSelectors) {
    titleElement = document.querySelector(selector);
    if (titleElement) {
      console.log('[Medium Extractor] Found title with selector:', selector);
      break;
    }
  }
  
  if (titleElement) {
    article.title = titleElement.textContent.trim();
  }

  const subtitleSelectors = [
    '[data-testid="subtitle"]',
    'h2[class*="subtitle"]',
    'h4[class*="subtitle"]',
    '.subtitle',
    'h2.graf--subtitle',
    'h4.graf--subtitle'
  ];
  
  let subtitleElement = null;
  for (const selector of subtitleSelectors) {
    subtitleElement = document.querySelector(selector);
    if (subtitleElement && subtitleElement !== titleElement) {
      console.log('[Medium Extractor] Found subtitle with selector:', selector);
      break;
    }
  }
  
  if (subtitleElement) {
    article.subtitle = subtitleElement.textContent.trim();
  }

  const articleBodySelectors = [
    'article',
    '[role="main"]',
    '.postArticle-content',
    '.section-content',
    '[data-testid="storyContent"]'
  ];
  
  let articleBody = null;
  for (const selector of articleBodySelectors) {
    articleBody = document.querySelector(selector);
    if (articleBody) {
      console.log('[Medium Extractor] Found article body with selector:', selector);
      break;
    }
  }

  if (!articleBody) {
    throw new Error('Could not find article content on this page');
  }

  const contentElements = articleBody.querySelectorAll('h1, h2, h3, h4, p, figure, ul, ol, blockquote, pre');
  
  const titleText = article.title.toLowerCase();
  const processedElements = [];

  for (const element of contentElements) {
    const elementText = element.textContent.trim().toLowerCase();
    
    if (elementText === titleText && (element.tagName === 'H1' || element.tagName === 'H3')) {
      console.log('[Medium Extractor] Skipping title element in content');
      continue;
    }
    
    const parsed = MediumParser.parseElement(element);
    
    if (parsed) {
      if (parsed.type === 'image') {
        console.log('[Medium Extractor] Processing image:', parsed.src);
        try {
          const dataURL = await MediumParser.imageToDataURL(parsed.src);
          parsed.dataURL = dataURL;
          console.log('[Medium Extractor] Image converted, data URL length:', dataURL.length);
          article.images.push({
            original: parsed.src,
            dataURL: dataURL,
            alt: parsed.alt,
            caption: parsed.caption
          });
        } catch (error) {
          console.error('[Medium Extractor] Failed to convert image:', parsed.src, error);
        }
      }
      
      article.content.push(parsed);
    }
  }

  console.log('[Medium Extractor] Extraction complete:', {
    title: article.title,
    subtitle: article.subtitle,
    contentBlocks: article.content.length,
    images: article.images.length
  });

  console.log('[Medium Extractor] Content breakdown:');
  const breakdown = {};
  article.content.forEach(block => {
    breakdown[block.type] = (breakdown[block.type] || 0) + 1;
  });
  console.table(breakdown);

  console.log('[Medium Extractor] First 3 content blocks:', article.content.slice(0, 3));

  return article;
}

