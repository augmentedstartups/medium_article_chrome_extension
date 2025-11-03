console.log('[Service Worker] Medium to LinkedIn Extension loaded');

const Config = {
  delays: {
    newTabWait: 2500,
    existingTabWait: 1500
  }
};

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
  
  if (message.action === 'retryBodyPaste') {
    handleManualBodyRetry()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'retryBodyFromLinkedIn') {
    handleRetryFromLinkedIn(message.data.article)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'openKajabiAndInject') {
    handleKajabiInjection(message.data.article)
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
      console.log('[Service Worker] Waiting', Config.delays.existingTabWait, 'ms for existing tab...');
      await new Promise(resolve => setTimeout(resolve, Config.delays.existingTabWait));
    } else {
      console.log('[Service Worker] Opening new LinkedIn article page...');
      tab = await chrome.tabs.create({ 
        url: linkedInArticleURL,
        active: true 
      });
      console.log('[Service Worker] LinkedIn tab opened:', tab.id);
      await waitForTabLoad(tab.id);
      console.log('[Service Worker] Waiting', Config.delays.newTabWait, 'ms for new tab editor...');
      await new Promise(resolve => setTimeout(resolve, Config.delays.newTabWait));
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

async function handleManualBodyRetry() {
  console.log('[Service Worker] ═══════════════════════════════════════');
  console.log('[Service Worker] 🔄 MANUAL BODY RETRY REQUESTED');
  console.log('[Service Worker] ═══════════════════════════════════════');
  
  const result = await chrome.storage.local.get(['extractedArticle']);
  
  if (!result.extractedArticle) {
    throw new Error('No article found in storage. Please extract first.');
  }
  
  const tabs = await chrome.tabs.query({ 
    url: ['https://www.linkedin.com/article/*', 'https://linkedin.com/article/*']
  });
  
  if (tabs.length === 0) {
    throw new Error('No LinkedIn article tab found. Please open LinkedIn first.');
  }
  
  const tab = tabs[0];
  console.log('[Service Worker] Found LinkedIn tab:', tab.id);
  
  await chrome.tabs.update(tab.id, { active: true });
  
  const response = await chrome.tabs.sendMessage(tab.id, {
    action: 'retryBodyOnly',
    data: { article: result.extractedArticle }
  });
  
  console.log('[Service Worker] Manual retry result:', response);
  
  return {
    success: true,
    tabId: tab.id,
    result: response.result
  };
}

async function handleRetryFromLinkedIn(article) {
  console.log('[Service Worker] ═══════════════════════════════════════');
  console.log('[Service Worker] 🔄 RETRY REQUESTED (from LinkedIn)');
  console.log('[Service Worker] ═══════════════════════════════════════');
  
  const tabs = await chrome.tabs.query({ 
    active: true,
    currentWindow: true
  });
  
  if (tabs.length === 0) {
    throw new Error('No active tab found');
  }
  
  const tab = tabs[0];
  console.log('[Service Worker] Current tab:', tab.id);
  
  const response = await chrome.tabs.sendMessage(tab.id, {
    action: 'retryBodyOnly',
    data: { article: article }
  });
  
  console.log('[Service Worker] Retry from LinkedIn result:', response);
  
  return {
    success: true,
    tabId: tab.id,
    result: response.result
  };
}

async function handleKajabiInjection(article) {
  try {
    console.log('[Service Worker] Checking for Kajabi blog post tab...');
    
    const tabs = await chrome.tabs.query({ url: 'https://app.kajabi.com/admin/sites/*/blog_posts/*' });
    
    if (tabs.length === 0) {
      throw new Error('Please open a Kajabi blog post page first (New or Edit)');
    }
    
    const tab = tabs[0];
    console.log('[Service Worker] Found Kajabi tab:', tab.id);
    await chrome.tabs.update(tab.id, { active: true });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[Service Worker] Injecting article into Kajabi...');
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'injectToKajabi',
      data: { article }
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    console.log('[Service Worker] Article injected to Kajabi successfully:', response.result);
    
    return {
      success: true,
      result: response.result
    };
  } catch (error) {
    console.error('[Service Worker] Kajabi injection failed:', error);
    throw error;
  }
}

