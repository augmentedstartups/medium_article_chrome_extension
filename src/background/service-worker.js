console.log('[Service Worker] Medium to LinkedIn Extension loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractAndStore') {
    handleExtraction(sender.tab.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'openLinkedInAndInject') {
    handleLinkedInInjection(message.data.article)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleExtraction(tabId) {
  try {
    console.log('[Service Worker] Extracting article from tab:', tabId);
    
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractArticle' });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    await chrome.storage.local.set({ 
      extractedArticle: response.article,
      extractedAt: Date.now()
    });
    
    console.log('[Service Worker] Article extracted and stored');
    
    return { 
      success: true, 
      article: response.article 
    };
  } catch (error) {
    console.error('[Service Worker] Extraction failed:', error);
    throw error;
  }
}

async function handleLinkedInInjection(article) {
  try {
    console.log('[Service Worker] Checking for existing LinkedIn article tab...');
    
    const linkedInArticleURL = 'https://www.linkedin.com/article/new/';
    const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/article/*' });
    
    let tab;
    let isNewTab = false;
    
    if (tabs.length > 0) {
      tab = tabs[0];
      console.log('[Service Worker] Found existing LinkedIn tab:', tab.id);
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.tabs.reload(tab.id);
      await waitForTabLoad(tab.id);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('[Service Worker] Opening new LinkedIn article page...');
      tab = await chrome.tabs.create({ 
        url: linkedInArticleURL,
        active: true 
      });
      console.log('[Service Worker] LinkedIn tab opened:', tab.id);
      await waitForTabLoad(tab.id);
      await new Promise(resolve => setTimeout(resolve, 3000));
      isNewTab = true;
    }
    
    console.log('[Service Worker] Injecting article into LinkedIn...');
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'injectArticle',
      data: { article }
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    console.log('[Service Worker] Article injected successfully:', response.result);
    
    return { 
      success: true,
      tabId: tab.id,
      result: response.result 
    };
  } catch (error) {
    console.error('[Service Worker] LinkedIn injection failed:', error);
    throw error;
  }
}

async function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

