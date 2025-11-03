console.log('[LinkedIn Sidebar] Script loaded');

let currentArticle = null;

async function createSidebar() {
  if (document.getElementById('medium-article-sidebar')) {
    console.log('[LinkedIn Sidebar] Sidebar already exists');
    return;
  }
  
  const sidebar = document.createElement('div');
  sidebar.id = 'medium-article-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    width: 320px;
    max-height: 600px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  `;
  
  sidebar.innerHTML = `
    <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Medium Article</h3>
        <button id="sidebar-close" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px;">×</button>
      </div>
    </div>
    <div id="sidebar-content" style="padding: 16px; max-height: 500px; overflow-y: auto;">
      <div style="text-align: center; color: #666; padding: 40px 20px;">
        Loading article...
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  document.getElementById('sidebar-close').addEventListener('click', () => {
    sidebar.remove();
  });
  
  await loadArticle();
  
  console.log('[LinkedIn Sidebar] Sidebar created');
}

async function loadArticle() {
  const result = await chrome.storage.local.get(['extractedArticle', 'extractedAt']);
  
  if (!result.extractedArticle) {
    updateSidebarContent(`
      <div style="text-align: center; color: #666; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <p>No article extracted yet</p>
        <p style="font-size: 12px; margin-top: 8px;">Extract an article from Medium first</p>
      </div>
    `);
    return;
  }
  
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  
  if (!result.extractedAt || result.extractedAt < fiveMinutesAgo) {
    updateSidebarContent(`
      <div style="text-align: center; color: #666; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <p>Article expired</p>
        <p style="font-size: 12px; margin-top: 8px;">Extract a new article from Medium</p>
      </div>
    `);
    return;
  }
  
  currentArticle = result.extractedArticle;
  
  const imageCount = currentArticle.content.filter(b => b.type === 'image').length;
  const textCount = currentArticle.content.filter(b => b.type === 'p' || b.type.startsWith('h')).length;
  
  const previewText = currentArticle.content.find(b => b.type === 'p')?.content || '';
  const truncated = previewText.substring(0, 150) + (previewText.length > 150 ? '...' : '');
  
  updateSidebarContent(`
    <div style="margin-bottom: 16px;">
      <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; line-height: 1.4;">
        ${escapeHTML(currentArticle.title)}
      </h4>
      ${currentArticle.subtitle ? `
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #666;">
          ${escapeHTML(currentArticle.subtitle)}
        </p>
      ` : ''}
      <div style="display: flex; gap: 12px; font-size: 12px; color: #666; margin-bottom: 12px;">
        <span>📝 ${textCount} text blocks</span>
        <span>🖼️ ${imageCount} images</span>
      </div>
      <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.5;">
        ${escapeHTML(truncated)}
      </p>
    </div>
    
    <button id="insert-article-btn" style="
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s;
    ">
      ✨ Insert Article
    </button>
    
    <div style="margin-top: 12px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 11px; color: #666;">
      <strong>Note:</strong> This will insert text and images sequentially. Takes ~3-5s per image.
    </div>
    
    <div id="insert-status" style="margin-top: 12px; padding: 12px; border-radius: 8px; font-size: 12px; display: none;"></div>
  `);
  
  const insertBtn = document.getElementById('insert-article-btn');
  insertBtn.addEventListener('mouseenter', () => {
    insertBtn.style.transform = 'translateY(-2px)';
  });
  insertBtn.addEventListener('mouseleave', () => {
    insertBtn.style.transform = 'translateY(0)';
  });
  insertBtn.addEventListener('click', handleInsertArticle);
  
  console.log('[LinkedIn Sidebar] Article loaded:', {
    title: currentArticle.title,
    blocks: currentArticle.content.length,
    images: imageCount,
    text: textCount
  });
}

function updateSidebarContent(html) {
  const content = document.getElementById('sidebar-content');
  if (content) {
    content.innerHTML = html;
  }
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleInsertArticle() {
  if (!currentArticle) {
    showStatus('error', 'No article to insert');
    return;
  }
  
  const btn = document.getElementById('insert-article-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Inserting...';
  btn.style.background = '#ccc';
  
  try {
    showStatus('info', 'Starting insertion...');
    
    const editor = await LinkedInDOM.waitForEditor();
    console.log('[LinkedIn Sidebar] ✅ Editor found');
    
    showStatus('info', 'Inserting content...');
    
    await FileUploadStrategy.inject(editor, currentArticle);
    
    showStatus('success', '✅ Article inserted successfully!');
    
    setTimeout(() => {
      const sidebar = document.getElementById('medium-article-sidebar');
      if (sidebar) sidebar.remove();
    }, 3000);
    
  } catch (error) {
    console.error('[LinkedIn Sidebar] Insertion failed:', error);
    showStatus('error', `❌ Failed: ${error.message}`);
    
    btn.disabled = false;
    btn.textContent = '✨ Insert Article';
    btn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  }
}

function showStatus(type, message) {
  const status = document.getElementById('insert-status');
  if (!status) return;
  
  const colors = {
    info: { bg: '#e3f2fd', text: '#1976d2' },
    success: { bg: '#e8f5e9', text: '#388e3c' },
    error: { bg: '#ffebee', text: '#d32f2f' }
  };
  
  const color = colors[type] || colors.info;
  
  status.style.display = 'block';
  status.style.background = color.bg;
  status.style.color = color.text;
  status.textContent = message;
}

if (window.location.href.includes('linkedin.com')) {
  const observer = new MutationObserver(() => {
    if (window.location.href.includes('/post/new') || 
        window.location.href.includes('/article/new') ||
        window.location.href.includes('/article/edit')) {
      
      if (!document.getElementById('medium-article-sidebar')) {
        setTimeout(createSidebar, 1000);
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  if (window.location.href.includes('/post/new') || 
      window.location.href.includes('/article/new') ||
      window.location.href.includes('/article/edit')) {
    setTimeout(createSidebar, 1000);
  }
}

