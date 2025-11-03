console.log('[Kajabi Image Upload Test] Initializing test button...');

function injectImageUploadTestButton() {
  if (document.getElementById('kajabi-image-test-btn')) {
    console.log('[Kajabi Image Upload Test] Button already exists');
    return;
  }

  const button = document.createElement('button');
  button.id = 'kajabi-image-test-btn';
  button.textContent = '🖼️ Upload First Image';
  button.style.cssText = `
    position: fixed;
    top: 240px;
    right: 20px;
    z-index: 999999;
    padding: 12px 20px;
    background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.6)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.4)';
  });

  button.addEventListener('click', async () => {
    console.log('[Kajabi Image Upload Test] Button clicked');
    await uploadFirstImage(button);
  });

  document.body.appendChild(button);
  console.log('[Kajabi Image Upload Test] ✅ Button injected');
}

async function uploadFirstImage(button) {
  const originalText = button.textContent;
  
  try {
    button.disabled = true;
    button.textContent = '⏳ Loading...';
    button.style.background = '#6B7280';

    console.log('[Kajabi Image Upload Test] ═══════════════════════════════════════');
    console.log('[Kajabi Image Upload Test] 🖼️ UPLOADING FIRST IMAGE');
    console.log('[Kajabi Image Upload Test] ═══════════════════════════════════════');

    const stored = await chrome.storage.local.get(['extractedFirstImage']);
    
    if (!stored.extractedFirstImage) {
      throw new Error('No image found. Please extract image from Medium first.');
    }

    const imageData = stored.extractedFirstImage;
    console.log('[Kajabi Image Upload Test] Image data loaded, length:', imageData.dataURL.length);

    button.textContent = '📤 Uploading 1/2...';
    
    await uploadToSocialImage(imageData, 1);
    
    button.textContent = '📤 Uploading 2/2...';
    
    await uploadToSocialImage(imageData, 2);

    button.textContent = '✅ Uploaded!';
    button.style.background = '#10B981';

    console.log('[Kajabi Image Upload Test] ═══════════════════════════════════════');
    console.log('[Kajabi Image Upload Test] ✅ ✅ BOTH IMAGES UPLOADED ✅ ✅');
    console.log('[Kajabi Image Upload Test] ═══════════════════════════════════════');

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
      button.disabled = false;
    }, 3000);

  } catch (error) {
    console.error('[Kajabi Image Upload Test] ❌ Upload failed:', error);
    
    button.textContent = '❌ Failed';
    button.style.background = '#EF4444';

    alert(`Image Upload Failed:\n${error.message}\n\nCheck console for details.`);

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
      button.disabled = false;
    }, 3000);
  }
}

async function uploadToSocialImage(imageData, uploadNumber) {
  console.log(`[Kajabi Image Upload Test] Starting upload ${uploadNumber}...`);
  
  const dropdownButtons = document.querySelectorAll('button[data-sage-upload-card-target="dropdownTrigger"]');
  
  if (dropdownButtons.length < uploadNumber) {
    throw new Error(`Upload button ${uploadNumber} not found. Found ${dropdownButtons.length} buttons.`);
  }

  const dropdownButton = dropdownButtons[uploadNumber - 1];
  console.log(`[Kajabi Image Upload Test] Found dropdown button ${uploadNumber}:`, dropdownButton.textContent.trim());
  
  dropdownButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await delay(300);
  
  dropdownButton.click();
  console.log(`[Kajabi Image Upload Test] Clicked dropdown ${uploadNumber}`);
  await delay(800);

  let uploadLink = null;
  const allLinks = document.querySelectorAll('a.sage-dropdown__item-control, a.fp-input');
  console.log(`[Kajabi Image Upload Test] Found ${allLinks.length} potential upload links`);
  
  for (const link of allLinks) {
    if (link.textContent.includes('Upload') && link.offsetParent !== null) {
      uploadLink = link;
      console.log(`[Kajabi Image Upload Test] Found visible upload link:`, link.textContent.trim());
      break;
    }
  }
  
  if (!uploadLink) {
    const fpInputs = document.querySelectorAll('.fp-input');
    console.log(`[Kajabi Image Upload Test] Trying fp-input fallback, found ${fpInputs.length}`);
    for (const input of fpInputs) {
      if (input.offsetParent !== null) {
        uploadLink = input;
        break;
      }
    }
  }
  
  if (!uploadLink) {
    throw new Error(`Upload link ${uploadNumber} not found. Dropdown may not have opened.`);
  }
  
  uploadLink.click();
  console.log(`[Kajabi Image Upload Test] Clicked upload link ${uploadNumber}`);
  await delay(1500);

  const fileInput = await waitForFileInput();
  console.log(`[Kajabi Image Upload Test] Found file input ${uploadNumber}:`, fileInput);

  const file = await dataURLtoFile(imageData.dataURL, `cover-image-${uploadNumber}.jpg`);
  console.log(`[Kajabi Image Upload Test] Created file ${uploadNumber}:`, file.name, file.size, 'bytes');

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  fileInput.dispatchEvent(new Event('input', { bubbles: true }));

  console.log(`[Kajabi Image Upload Test] File selected, waiting for upload button...`);
  
  await delay(1500);
  
  const uploadButton = await waitForUploadButton();
  console.log(`[Kajabi Image Upload Test] Found upload button ${uploadNumber}:`, uploadButton.textContent.trim());
  
  uploadButton.click();
  console.log(`[Kajabi Image Upload Test] Clicked upload button ${uploadNumber}`);
  
  await delay(2000);
  
  const saveButton = await waitForSaveButton();
  console.log(`[Kajabi Image Upload Test] Found save button ${uploadNumber}`);
  
  saveButton.click();
  console.log(`[Kajabi Image Upload Test] Clicked save button ${uploadNumber}`);
  
  await waitForModalClose();
  console.log(`[Kajabi Image Upload Test] Modal closed for upload ${uploadNumber}`);
  
  await delay(1000);
  
  console.log(`[Kajabi Image Upload Test] ✅ Upload ${uploadNumber} complete`);
}

async function waitForFileInput(timeout = 8000) {
  const startTime = Date.now();
  
  console.log('[Kajabi Image Upload Test] Waiting for file input...');
  
  while (Date.now() - startTime < timeout) {
    const inputs = document.querySelectorAll('input[type="file"]');
    console.log(`[Kajabi Image Upload Test] Found ${inputs.length} file inputs`);
    
    for (const input of inputs) {
      if (input.offsetParent !== null || input.style.display !== 'none') {
        console.log('[Kajabi Image Upload Test] Found visible file input:', input);
        return input;
      }
    }
    
    if (inputs.length > 0) {
      console.log('[Kajabi Image Upload Test] Using last file input (may be hidden)');
      return inputs[inputs.length - 1];
    }
    
    await delay(200);
  }
  
  const allInputs = document.querySelectorAll('input[type="file"]');
  console.error('[Kajabi Image Upload Test] Timeout. Final state:', allInputs.length, 'file inputs found');
  throw new Error(`File input did not appear after ${timeout}ms. Found ${allInputs.length} file inputs.`);
}

async function waitForUploadButton(timeout = 5000) {
  const startTime = Date.now();
  
  console.log('[Kajabi Image Upload Test] Waiting for upload button...');
  
  while (Date.now() - startTime < timeout) {
    const uploadButtons = document.querySelectorAll('button.uppy-StatusBar-actionBtn--upload, button[aria-label*="Upload"]');
    
    for (const button of uploadButtons) {
      if ((button.textContent.includes('Upload') && button.textContent.includes('file')) && button.offsetParent !== null) {
        console.log('[Kajabi Image Upload Test] Found visible upload button:', button.textContent.trim());
        return button;
      }
    }
    
    await delay(200);
  }
  
  throw new Error('Upload button did not appear after file selection');
}

async function waitForSaveButton(timeout = 8000) {
  const startTime = Date.now();
  
  console.log('[Kajabi Image Upload Test] Waiting for save button...');
  
  while (Date.now() - startTime < timeout) {
    const saveButtons = document.querySelectorAll('button.uppy-DashboardContent-save, button[type="button"]');
    
    for (const button of saveButtons) {
      if (button.textContent.includes('Save') && button.offsetParent !== null) {
        console.log('[Kajabi Image Upload Test] Found visible save button:', button.textContent.trim());
        return button;
      }
    }
    
    await delay(200);
  }
  
  throw new Error('Save button did not appear after upload');
}

async function waitForModalClose(timeout = 5000) {
  const startTime = Date.now();
  
  console.log('[Kajabi Image Upload Test] Waiting for modal to close...');
  
  while (Date.now() - startTime < timeout) {
    const modals = document.querySelectorAll('.uppy-Dashboard, [role="dialog"]');
    const visibleModals = Array.from(modals).filter(m => m.offsetParent !== null);
    
    if (visibleModals.length === 0) {
      console.log('[Kajabi Image Upload Test] Modal closed');
      return true;
    }
    
    await delay(200);
  }
  
  console.log('[Kajabi Image Upload Test] Modal still visible, continuing anyway');
  return false;
}

async function dataURLtoFile(dataURL, filename) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectImageUploadTestButton);
} else {
  injectImageUploadTestButton();
}

setTimeout(() => {
  if (!document.getElementById('kajabi-image-test-btn')) {
    injectImageUploadTestButton();
  }
}, 2000);

