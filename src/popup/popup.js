const StrategyDescriptions = {
  CLIPBOARD_API: {
    name: 'Clipboard API',
    description: 'Uses navigator.clipboard.write() to write HTML to clipboard, then dispatches paste event',
    pros: 'Fast, fully automated',
    cons: 'May be blocked by browser security',
    likelihood: 'Low - probably blocked',
    likelihoodClass: 'low'
  },
  FILE_UPLOAD: {
    name: 'File Upload (RECOMMENDED)',
    description: 'Uploads each image individually via LinkedIn\'s upload button (like cover image)',
    pros: 'Most reliable - uses LinkedIn\'s native upload, images persist on refresh',
    cons: 'Slower (2-5s per image)',
    likelihood: 'High - working ✓',
    likelihoodClass: 'high'
  },
  USER_PASTE: {
    name: 'User Paste',
    description: 'Writes to clipboard and shows overlay instructing user to press Ctrl+V',
    pros: 'Uses real paste handler, reliable',
    cons: 'Requires user action (semi-automated)',
    likelihood: 'High - should work',
    likelihoodClass: 'high'
  },
  PROSEMIRROR: {
    name: 'ProseMirror',
    description: 'Directly injects content via LinkedIn\'s ProseMirror editor transactions',
    pros: 'Fast, works with editor internals',
    cons: 'May be obfuscated, could break',
    likelihood: 'Medium - depends on access',
    likelihoodClass: 'medium'
  }
};

let extractedArticle = null;

document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const postBtn = document.getElementById('postBtn');
  const kajabiBtn = document.getElementById('kajabiBtn');
  const strategySelector = document.getElementById('strategySelector');
  
  extractBtn.addEventListener('click', handleExtract);
  postBtn.addEventListener('click', handlePost);
  kajabiBtn.addEventListener('click', handleKajabiPost);
  strategySelector.addEventListener('change', handleStrategyChange);
  
  loadSelectedStrategy();
  checkForExistingArticle();
});

async function loadSelectedStrategy() {
  const result = await chrome.storage.sync.get(['imageStrategy']);
  const strategy = result.imageStrategy || 'FILE_UPLOAD';
  
  document.getElementById('strategySelector').value = strategy;
  updateStrategyDescription(strategy);
}

async function handleStrategyChange(event) {
  const strategy = event.target.value;
  
  await chrome.storage.sync.set({ imageStrategy: strategy });
  updateStrategyDescription(strategy);
  
  console.log('[Popup] Strategy changed to:', strategy);
}

function updateStrategyDescription(strategy) {
  const desc = StrategyDescriptions[strategy];
  const descDiv = document.getElementById('strategyDescription');
  
  if (desc) {
    descDiv.innerHTML = `
      <strong>${desc.name}</strong>
      <div class="desc-line">${desc.description}</div>
      <div class="desc-line"><strong>Pros:</strong> ${desc.pros}</div>
      <div class="desc-line"><strong>Cons:</strong> ${desc.cons}</div>
      <div class="likelihood ${desc.likelihoodClass}">Success Likelihood: ${desc.likelihood}</div>
    `;
  }
}

async function checkForExistingArticle() {
  const result = await chrome.storage.local.get(['extractedArticle', 'extractedAt']);
  
  if (result.extractedArticle) {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (result.extractedAt && result.extractedAt > fiveMinutesAgo) {
      extractedArticle = result.extractedArticle;
      showPreview(extractedArticle);
      updateStatus('ready', 'Article ready to post');
      document.getElementById('kajabiBtn').classList.remove('hidden');
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
    document.getElementById('kajabiBtn').classList.remove('hidden');
    
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

async function handleKajabiPost() {
  try {
    if (!extractedArticle) {
      throw new Error('No article to post. Please extract first.');
    }
    
    updateStatus('posting', 'Posting to Kajabi...');
    disableButtons();
    
    const response = await chrome.runtime.sendMessage({
      action: 'openKajabiAndInject',
      data: { article: extractedArticle }
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    updateStatus('success', 'Article posted to Kajabi!');
    
    setTimeout(() => {
      window.close();
    }, 2000);
    
  } catch (error) {
    console.error('Kajabi posting error:', error);
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
  document.getElementById('kajabiBtn').disabled = true;
}

function enableButtons() {
  document.getElementById('extractBtn').disabled = false;
  document.getElementById('postBtn').disabled = false;
  document.getElementById('kajabiBtn').disabled = false;
}

