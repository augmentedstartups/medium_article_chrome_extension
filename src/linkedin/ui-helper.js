let floatingRetryButton = null;

function injectLinkedInRetryButton() {
  if (floatingRetryButton) return;

  floatingRetryButton = document.createElement('div');
  floatingRetryButton.id = 'linkedin-retry-button';
  floatingRetryButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 4v6h6"></path>
      <path d="M23 20v-6h-6"></path>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
    </svg>
    <span>Retry Body</span>
  `;

  const styles = document.createElement('style');
  styles.textContent = `
    #linkedin-retry-button {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
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
      box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
      z-index: 999999;
      transition: all 0.3s ease;
      opacity: 0;
      animation: slideIn 0.5s ease forwards;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    #linkedin-retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }

    #linkedin-retry-button svg {
      width: 18px;
      height: 18px;
    }

    #linkedin-retry-button.loading {
      opacity: 0.7;
      cursor: wait;
    }

    #linkedin-retry-button.loading svg {
      animation: spin 1s linear infinite;
    }

    #linkedin-retry-button.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    #linkedin-retry-button.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    #linkedin-retry-button.hidden {
      display: none;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    #linkedin-retry-tooltip {
      position: fixed;
      bottom: 80px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      z-index: 999998;
      max-width: 300px;
      line-height: 1.4;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    #linkedin-retry-tooltip.visible {
      opacity: 1;
    }

    #linkedin-retry-tooltip::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 40px;
      width: 12px;
      height: 12px;
      background: rgba(0, 0, 0, 0.9);
      transform: rotate(45deg);
    }
  `;

  document.head.appendChild(styles);
  document.body.appendChild(floatingRetryButton);

  floatingRetryButton.addEventListener('click', handleRetryClick);

  console.log('[LinkedIn UI Helper] Retry button injected');
  
  checkForArticleAndShowButton();
}

async function checkForArticleAndShowButton() {
  try {
    const result = await chrome.storage.local.get(['extractedArticle']);
    
    if (result.extractedArticle) {
      console.log('[LinkedIn UI Helper] ✓ Extracted article found in storage');
      floatingRetryButton.classList.remove('hidden');
      showTooltip('Article ready! Click to retry body paste', 3000);
    } else {
      console.log('[LinkedIn UI Helper] ⚠️ No extracted article found');
      floatingRetryButton.classList.add('hidden');
    }
  } catch (error) {
    console.error('[LinkedIn UI Helper] Error checking for article:', error);
  }
}

function showTooltip(message, duration = 3000) {
  let tooltip = document.getElementById('linkedin-retry-tooltip');
  
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'linkedin-retry-tooltip';
    document.body.appendChild(tooltip);
  }
  
  tooltip.textContent = message;
  tooltip.classList.add('visible');
  
  setTimeout(() => {
    tooltip.classList.remove('visible');
  }, duration);
}

async function handleRetryClick() {
  console.log('[LinkedIn UI Helper] ═══════════════════════════════════════');
  console.log('[LinkedIn UI Helper] 🔄 RETRY BUTTON CLICKED');
  console.log('[LinkedIn UI Helper] ═══════════════════════════════════════');
  
  const button = floatingRetryButton;
  const originalContent = button.innerHTML;
  
  try {
    const result = await chrome.storage.local.get(['extractedArticle']);
    
    if (!result.extractedArticle) {
      showTooltip('❌ No article found! Please extract from Medium first.', 4000);
      button.classList.add('error');
      setTimeout(() => button.classList.remove('error'), 2000);
      return;
    }
    
    button.classList.add('loading');
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 4v6h6"></path>
        <path d="M23 20v-6h-6"></path>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
      </svg>
      <span>Retrying...</span>
    `;
    
    showTooltip('🔄 Retrying body paste...', 2000);
    
    const response = await chrome.runtime.sendMessage({
      action: 'retryBodyFromLinkedIn',
      data: { article: result.extractedArticle }
    });
    
    console.log('[LinkedIn UI Helper] Retry response:', response);
    
    if (response && response.success) {
      button.classList.remove('loading');
      button.classList.add('success');
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Success!</span>
      `;
      
      const attempts = response.result?.attempts || 1;
      showTooltip(`✅ Body pasted successfully! (${attempts} ${attempts === 1 ? 'attempt' : 'attempts'})`, 4000);
      
      setTimeout(() => {
        button.classList.remove('success');
        button.innerHTML = originalContent;
      }, 3000);
    } else {
      throw new Error(response?.error || 'Unknown error');
    }
  } catch (error) {
    console.error('[LinkedIn UI Helper] Retry error:', error);
    button.classList.remove('loading');
    button.classList.add('error');
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <span>Failed</span>
    `;
    
    showTooltip(`❌ Retry failed: ${error.message}`, 4000);
    
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = originalContent;
    }, 3000);
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.extractedArticle) {
    console.log('[LinkedIn UI Helper] Article storage changed, updating button visibility');
    checkForArticleAndShowButton();
  }
});

if (window.location.href.includes('/article/edit/') || window.location.href.includes('/article/new')) {
  console.log('[LinkedIn UI Helper] On LinkedIn article edit page, injecting retry button');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLinkedInRetryButton);
  } else {
    injectLinkedInRetryButton();
  }
} else {
  console.log('[LinkedIn UI Helper] Not on article edit page, skipping button injection');
}



