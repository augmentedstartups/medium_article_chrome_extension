let panel = null;
let floatingButton = null;

function injectFloatingButton() {
  if (floatingButton) return;

  floatingButton = document.createElement('div');
  floatingButton.id = 'medium-linkedin-button';
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
    <span>Post to LinkedIn</span>
  `;

  const styles = document.createElement('style');
  styles.textContent = `
    #medium-linkedin-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      z-index: 999999;
      transition: all 0.3s ease;
    }

    #medium-linkedin-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    #medium-linkedin-button svg {
      width: 20px;
      height: 20px;
    }

    #medium-linkedin-button.loading {
      opacity: 0.7;
      cursor: wait;
    }

    #medium-linkedin-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      z-index: 999998;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    #medium-linkedin-panel.visible {
      right: 0;
    }

    #medium-linkedin-panel .panel-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #medium-linkedin-panel .panel-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    #medium-linkedin-panel .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: background 0.2s;
    }

    #medium-linkedin-panel .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    #medium-linkedin-panel .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    #medium-linkedin-panel .status {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #medium-linkedin-panel .status.success {
      background: #d1fae5;
      color: #065f46;
    }

    #medium-linkedin-panel .status.error {
      background: #fee2e2;
      color: #991b1b;
    }

    #medium-linkedin-panel .status.loading {
      background: #fef3c7;
      color: #92400e;
    }

    #medium-linkedin-panel .status-icon {
      font-size: 20px;
    }

    #medium-linkedin-panel .preview-section {
      margin-bottom: 20px;
    }

    #medium-linkedin-panel .preview-section h3 {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    #medium-linkedin-panel .preview-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    #medium-linkedin-panel .preview-stats {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
    }

    #medium-linkedin-panel .preview-text {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
    }

    #medium-linkedin-panel .content-breakdown {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
      font-size: 13px;
    }

    #medium-linkedin-panel .content-breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    #medium-linkedin-panel .content-breakdown-item:last-child {
      border-bottom: none;
    }

    #medium-linkedin-panel .content-breakdown-label {
      color: #6b7280;
    }

    #medium-linkedin-panel .content-breakdown-value {
      color: #111827;
      font-weight: 600;
    }

    #medium-linkedin-panel .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
    }

    #medium-linkedin-panel .btn {
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    #medium-linkedin-panel .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #medium-linkedin-panel .btn-primary {
      background: #667eea;
      color: white;
    }

    #medium-linkedin-panel .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-1px);
    }

    #medium-linkedin-panel .btn-success {
      background: #10b981;
      color: white;
    }

    #medium-linkedin-panel .btn-success:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading .status-icon {
      animation: spin 1s linear infinite;
    }
  `;

  document.head.appendChild(styles);
  document.body.appendChild(floatingButton);

  floatingButton.addEventListener('click', handleButtonClick);

  console.log('[Medium UI] Floating button injected');
}

function injectPanel() {
  if (panel) return;

  panel = document.createElement('div');
  panel.id = 'medium-linkedin-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <h2>Post to LinkedIn</h2>
      <button class="close-btn">×</button>
    </div>
    <div class="panel-content">
      <div class="status loading" id="panel-status">
        <span class="status-icon">●</span>
        <span id="panel-status-text">Loading...</span>
      </div>
      <div class="action-buttons" style="margin-bottom: 20px;">
        <button class="btn btn-success" id="panel-insert-btn" style="display: none;">Insert into LinkedIn</button>
      </div>
      <div id="panel-preview" style="display: none;">
        <div class="preview-section">
          <h3>Article Title</h3>
          <div class="preview-title" id="panel-title"></div>
        </div>
        <div class="preview-section">
          <h3>Content Breakdown</h3>
          <div class="content-breakdown" id="panel-breakdown"></div>
        </div>
        <div class="preview-section">
          <h3>Statistics</h3>
          <div class="preview-stats" id="panel-stats"></div>
        </div>
        <div class="preview-section">
          <h3>Content Preview</h3>
          <div class="preview-text" id="panel-text"></div>
        </div>
      </div>
      <div id="panel-retry-section" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
        <button id="retry-body-btn" class="btn" style="background: #ff6b35; color: white; margin-top: 10px;">
          🔄 Retry Body Paste (Manual Failsafe)
        </button>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
          Use this if the article body didn't paste correctly into LinkedIn
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  panel.querySelector('.close-btn').addEventListener('click', closePanel);
  panel.querySelector('#panel-insert-btn').addEventListener('click', handleInsert);
  panel.querySelector('#retry-body-btn').addEventListener('click', handleManualRetry);

  console.log('[Medium UI] Panel injected');
}

function openPanel() {
  if (!panel) {
    injectPanel();
  }
  setTimeout(() => {
    panel.classList.add('visible');
  }, 10);
}

function closePanel() {
  if (panel) {
    panel.classList.remove('visible');
  }
}

async function handleButtonClick() {
  openPanel();
  
  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.error('[Medium UI] Chrome API not available');
      throw new Error('Chrome extension API not available');
    }

    const result = await chrome.storage.local.get(['extractedArticle', 'extractedAt']);
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (result.extractedArticle && result.extractedAt && result.extractedAt > fiveMinutesAgo) {
      console.log('[Medium UI] Using cached article, auto-inserting...');
      showExtractedState(result.extractedArticle);
      setTimeout(() => {
        handleInsert();
      }, 500);
    } else {
      console.log('[Medium UI] Auto-extracting and inserting article...');
      const statusDiv = document.getElementById('panel-status');
      const statusText = document.getElementById('panel-status-text');
      statusDiv.className = 'status loading';
      statusText.textContent = 'Extracting article...';
      
      setTimeout(() => {
        handleExtractAndInsert();
      }, 100);
    }
  } catch (error) {
    console.error('[Medium UI] Error in handleButtonClick:', error);
    const statusDiv = document.getElementById('panel-status');
    const statusText = document.getElementById('panel-status-text');
    if (statusDiv && statusText) {
      statusDiv.className = 'status error';
      statusText.textContent = 'Error: ' + error.message;
    }
  }
}

async function handleExtractAndInsert() {
  const statusDiv = document.getElementById('panel-status');
  const statusText = document.getElementById('panel-status-text');
  const insertBtn = document.getElementById('panel-insert-btn');
  const previewDiv = document.getElementById('panel-preview');

  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime) {
      throw new Error('Chrome extension API not available');
    }

    statusDiv.className = 'status loading';
    statusText.textContent = 'Extracting article...';
    insertBtn.disabled = true;

    const article = await extractMediumArticle();

    await chrome.storage.local.set({
      extractedArticle: article,
      extractedAt: Date.now()
    });

    buildAndShowPreview(article);

    statusDiv.className = 'status success';
    statusText.textContent = 'Article extracted! Now inserting...';
    insertBtn.style.display = 'block';
    insertBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 500));

    statusDiv.className = 'status loading';
    statusText.textContent = 'Inserting into LinkedIn...';

    const response = await chrome.runtime.sendMessage({
      action: 'openLinkedInAndInject',
      data: { article }
    });

    console.log('[Medium UI] Response from service worker:', response);

    if (!response.success) {
      throw new Error(response.error);
    }

    statusDiv.className = 'status success';
    const coverMsg = response.result.coverImageUploaded ? ' + cover' : '';
    const attemptsMsg = response.result.insertionAttempts > 1 ? ` (${response.result.insertionAttempts} attempts)` : '';
    statusText.textContent = `✓ Complete! ${response.result.contentBlocks} blocks, ${response.result.imagesInjected} images${coverMsg}${attemptsMsg}`;

    insertBtn.disabled = false;
    insertBtn.textContent = 'Insert Again (if needed)';

    setTimeout(() => {
      insertBtn.textContent = 'Insert into LinkedIn';
    }, 5000);

  } catch (error) {
    console.error('[Medium UI] Auto extraction/insertion error:', error);
    statusDiv.className = 'status error';
    statusText.textContent = `Error: ${error.message}`;
    insertBtn.disabled = false;
  }
}

function showExtractedState(article) {
  buildAndShowPreview(article);
  
  const insertBtn = document.getElementById('panel-insert-btn');
  insertBtn.style.display = 'block';
  
  const statusDiv = document.getElementById('panel-status');
  const statusText = document.getElementById('panel-status-text');
  statusDiv.className = 'status success';
  statusText.textContent = 'Article ready to insert';
}

function buildAndShowPreview(article) {
  const previewDiv = document.getElementById('panel-preview');
  
  document.getElementById('panel-title').textContent = article.title || 'No title';

  const contentTypes = {
    h1: 0, h2: 0, h3: 0, h4: 0,
    p: 0, image: 0, ul: 0, ol: 0,
    quote: 0, code: 0
  };

  article.content.forEach(block => {
    if (contentTypes.hasOwnProperty(block.type)) {
      contentTypes[block.type]++;
    }
  });

  const wordCount = article.content
    .filter(block => block.type === 'p' || block.type.startsWith('h'))
    .reduce((count, block) => count + block.content.split(/\s+/).length, 0);

  const breakdownHTML = `
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Paragraphs</span>
      <span class="content-breakdown-value">${contentTypes.p}</span>
    </div>
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Headings</span>
      <span class="content-breakdown-value">${contentTypes.h1 + contentTypes.h2 + contentTypes.h3 + contentTypes.h4}</span>
    </div>
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Images</span>
      <span class="content-breakdown-value">${contentTypes.image}</span>
    </div>
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Lists</span>
      <span class="content-breakdown-value">${contentTypes.ul + contentTypes.ol}</span>
    </div>
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Quotes</span>
      <span class="content-breakdown-value">${contentTypes.quote}</span>
    </div>
    <div class="content-breakdown-item">
      <span class="content-breakdown-label">Total Words</span>
      <span class="content-breakdown-value">~${wordCount}</span>
    </div>
  `;

  document.getElementById('panel-breakdown').innerHTML = breakdownHTML;
  document.getElementById('panel-stats').textContent =
    `${article.content.length} total blocks • ${article.images.length} images • ~${wordCount} words`;

  let previewText = '';
  let charCount = 0;
  const maxChars = 500;

  for (const block of article.content) {
    if (charCount >= maxChars) break;

    if (block.type === 'p') {
      const text = block.content.replace(/<[^>]*>/g, '');
      previewText += text + '\n\n';
      charCount += text.length;
    } else if (block.type.startsWith('h')) {
      const text = block.content;
      previewText += `### ${text}\n\n`;
      charCount += text.length;
    } else if (block.type === 'image') {
      previewText += `[Image: ${block.alt || 'No alt text'}]\n\n`;
      charCount += 20;
    }
  }

  if (charCount >= maxChars) {
    previewText += '... (more content extracted)';
  }

  document.getElementById('panel-text').textContent = previewText || 'No preview available';
  
  previewDiv.style.display = 'block';
}

async function handleExtract() {
  const statusDiv = document.getElementById('panel-status');
  const statusText = document.getElementById('panel-status-text');
  const insertBtn = document.getElementById('panel-insert-btn');
  const previewDiv = document.getElementById('panel-preview');

  try {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('Chrome extension API not available');
    }

    statusDiv.className = 'status loading';
    statusText.textContent = 'Extracting article...';
    insertBtn.disabled = true;

    const article = await extractMediumArticle();

    await chrome.storage.local.set({
      extractedArticle: article,
      extractedAt: Date.now()
    });

    buildAndShowPreview(article);

    statusDiv.className = 'status success';
    statusText.textContent = 'Article ready to insert';
    insertBtn.style.display = 'block';
    insertBtn.disabled = false;

  } catch (error) {
    console.error('[Medium UI] Extraction error:', error);
    statusDiv.className = 'status error';
    statusText.textContent = `Error: ${error.message}`;
    insertBtn.disabled = false;
  }
}

async function handleInsert() {
  const statusDiv = document.getElementById('panel-status');
  const statusText = document.getElementById('panel-status-text');
  const insertBtn = document.getElementById('panel-insert-btn');
  const retrySection = document.getElementById('panel-retry-section');

  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime) {
      throw new Error('Chrome extension API not available');
    }

    statusDiv.className = 'status loading';
    statusText.textContent = 'Inserting into LinkedIn...';
    insertBtn.disabled = true;
    retrySection.style.display = 'none';

    const result = await chrome.storage.local.get(['extractedArticle']);

    if (!result.extractedArticle) {
      throw new Error('No article to post. Please extract first.');
    }

    console.log('[Medium UI] Sending article to LinkedIn...');

    const response = await chrome.runtime.sendMessage({
      action: 'openLinkedInAndInject',
      data: { article: result.extractedArticle }
    });

    console.log('[Medium UI] Response from service worker:', response);

    if (!response.success) {
      throw new Error(response.error);
    }

    statusDiv.className = 'status success';
    const coverMsg = response.result.coverImageUploaded ? ' + cover' : '';
    const attemptsMsg = response.result.insertionAttempts > 1 ? ` (${response.result.insertionAttempts} attempts)` : '';
    statusText.textContent = `✓ Inserted! ${response.result.contentBlocks} blocks, ${response.result.imagesInjected} images${coverMsg}${attemptsMsg}`;

    insertBtn.disabled = false;
    insertBtn.textContent = 'Insert Again (if needed)';
    retrySection.style.display = 'block';

    setTimeout(() => {
      insertBtn.textContent = 'Insert into LinkedIn';
    }, 5000);

  } catch (error) {
    console.error('[Medium UI] Insert error:', error);
    statusDiv.className = 'status error';
    statusText.textContent = `Error: ${error.message}`;
    insertBtn.disabled = false;
    insertBtn.textContent = 'Retry Insert';
    retrySection.style.display = 'block';
  }
}

async function handleManualRetry() {
  console.log('[Medium UI] ═══════════════════════════════════════');
  console.log('[Medium UI] 🔄 MANUAL RETRY TRIGGERED');
  console.log('[Medium UI] ═══════════════════════════════════════');
  
  const statusDiv = document.getElementById('panel-status');
  const statusText = document.getElementById('panel-status-text');
  const retryBtn = document.getElementById('retry-body-btn');
  
  statusDiv.className = 'status loading';
  statusText.textContent = '🔄 Manually retrying body paste...';
  retryBtn.disabled = true;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'retryBodyPaste'
    });
    
    console.log('[Medium UI] Manual retry response:', response);
    
    if (!response.success) {
      throw new Error(response.error);
    }

    statusDiv.className = 'status success';
    statusText.textContent = `✓ Manual retry successful! (${response.result.attempts} attempts)`;
    retryBtn.textContent = '✓ Body Pasted';
    setTimeout(() => {
      retryBtn.disabled = false;
      retryBtn.textContent = '🔄 Retry Body Paste (Manual Failsafe)';
    }, 3000);
  } catch (error) {
    console.error('[Medium UI] Manual retry error:', error);
    statusDiv.className = 'status error';
    statusText.textContent = '✗ Manual retry failed: ' + error.message;
    retryBtn.disabled = false;
  }
}

if (typeof chrome !== 'undefined' && chrome.storage && chrome.runtime) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingButton);
  } else {
    injectFloatingButton();
  }
} else {
  console.error('[Medium UI] Chrome extension API not available, skipping injection');
}

