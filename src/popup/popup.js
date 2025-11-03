let extractedArticle = null;

document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const postBtn = document.getElementById('postBtn');
  
  extractBtn.addEventListener('click', handleExtract);
  postBtn.addEventListener('click', handlePost);
  
  checkForExistingArticle();
});

async function checkForExistingArticle() {
  const result = await chrome.storage.local.get(['extractedArticle', 'extractedAt']);
  
  if (result.extractedArticle) {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (result.extractedAt && result.extractedAt > fiveMinutesAgo) {
      extractedArticle = result.extractedArticle;
      showPreview(extractedArticle);
      updateStatus('ready', 'Article ready to post');
    }
  }
}

async function handleExtract() {
  try {
    updateStatus('extracting', 'Extracting article...');
    disableButtons();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('medium.com')) {
      throw new Error('Please navigate to a Medium article first');
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'extractAndStore'
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    extractedArticle = response.article;
    showPreview(extractedArticle);
    updateStatus('success', 'Article extracted successfully!');
    
    document.getElementById('postBtn').classList.remove('hidden');
    
  } catch (error) {
    console.error('Extraction error:', error);
    updateStatus('error', `Error: ${error.message}`);
  } finally {
    enableButtons();
  }
}

async function handlePost() {
  try {
    if (!extractedArticle) {
      throw new Error('No article to post. Please extract first.');
    }
    
    updateStatus('posting', 'Opening LinkedIn and posting...');
    disableButtons();
    
    const response = await chrome.runtime.sendMessage({
      action: 'openLinkedInAndInject',
      data: { article: extractedArticle }
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    updateStatus('success', 'Article posted to LinkedIn!');
    
    setTimeout(() => {
      window.close();
    }, 2000);
    
  } catch (error) {
    console.error('Posting error:', error);
    updateStatus('error', `Error: ${error.message}`);
    enableButtons();
  }
}

function showPreview(article) {
  const previewSection = document.getElementById('previewSection');
  const previewTitle = document.getElementById('previewTitle');
  const previewStats = document.getElementById('previewStats');
  const previewText = document.getElementById('previewText');
  
  previewTitle.textContent = article.title || 'No title';
  
  const wordCount = article.content
    .filter(block => block.type === 'p' || block.type.startsWith('h'))
    .reduce((count, block) => count + block.content.split(/\s+/).length, 0);
  
  previewStats.textContent = `${article.content.length} blocks, ${article.images.length} images, ~${wordCount} words`;
  
  const firstParagraph = article.content.find(block => block.type === 'p');
  if (firstParagraph) {
    const text = firstParagraph.content.replace(/<[^>]*>/g, '');
    previewText.textContent = text.substring(0, 200) + (text.length > 200 ? '...' : '');
  } else {
    previewText.textContent = 'No preview available';
  }
  
  previewSection.classList.remove('hidden');
}

function updateStatus(state, message) {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('statusText');
  
  statusDiv.className = `status ${state}`;
  statusText.textContent = message;
}

function disableButtons() {
  document.getElementById('extractBtn').disabled = true;
  document.getElementById('postBtn').disabled = true;
}

function enableButtons() {
  document.getElementById('extractBtn').disabled = false;
  document.getElementById('postBtn').disabled = false;
}

