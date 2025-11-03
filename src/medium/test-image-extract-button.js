console.log('[Medium Image Test] Initializing test button...');

function injectImageTestButton() {
  if (document.getElementById('medium-image-test-btn')) {
    console.log('[Medium Image Test] Button already exists');
    return;
  }

  const button = document.createElement('button');
  button.id = 'medium-image-test-btn';
  button.textContent = '🖼️ Extract First Image';
  button.style.cssText = `
    position: fixed;
    top: 180px;
    right: 20px;
    z-index: 999999;
    padding: 12px 20px;
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
  });

  button.addEventListener('click', async () => {
    console.log('[Medium Image Test] Button clicked');
    await extractFirstImage(button);
  });

  document.body.appendChild(button);
  console.log('[Medium Image Test] ✅ Button injected');
}

async function extractFirstImage(button) {
  const originalText = button.textContent;
  
  try {
    button.disabled = true;
    button.textContent = '⏳ Extracting...';
    button.style.background = '#6B7280';

    console.log('[Medium Image Test] ═══════════════════════════════════════');
    console.log('[Medium Image Test] 🖼️ EXTRACTING FIRST IMAGE');
    console.log('[Medium Image Test] ═══════════════════════════════════════');

    const images = document.querySelectorAll('article img, figure img, .pw-post-body-paragraph img');
    
    if (images.length === 0) {
      throw new Error('No images found in the article');
    }

    const firstImage = images[0];
    console.log('[Medium Image Test] Found first image:', firstImage.src);

    const imageUrl = firstImage.src;
    
    button.textContent = '⬇️ Downloading...';
    
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const reader = new FileReader();
    const dataURL = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await chrome.storage.local.set({
      extractedFirstImage: {
        dataURL: dataURL,
        url: imageUrl,
        extractedAt: Date.now()
      }
    });

    button.textContent = '✅ Extracted!';
    button.style.background = '#10B981';

    console.log('[Medium Image Test] ✅ Image extracted and stored');
    console.log('[Medium Image Test] DataURL length:', dataURL.length);
    console.log('[Medium Image Test] ═══════════════════════════════════════');

    button.textContent = '🔄 Opening Kajabi...';
    
    const response = await chrome.runtime.sendMessage({
      action: 'openKajabiForImageTest'
    });

    if (response.success) {
      console.log('[Medium Image Test] ✅ Kajabi tab opened/activated');
    }

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      button.disabled = false;
    }, 2000);

  } catch (error) {
    console.error('[Medium Image Test] ❌ Extraction failed:', error);
    
    button.textContent = '❌ Failed';
    button.style.background = '#EF4444';

    alert(`Image Extraction Failed:\n${error.message}\n\nCheck console for details.`);

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      button.disabled = false;
    }, 3000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectImageTestButton);
} else {
  injectImageTestButton();
}

setTimeout(() => {
  if (!document.getElementById('medium-image-test-btn')) {
    injectImageTestButton();
  }
}, 2000);

