document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const openaiKeyInput = document.getElementById('openaiKey');
  const successMessage = document.getElementById('successMessage');
  
  const saved = await chrome.storage.sync.get(['openaiKey']);
  if (saved.openaiKey) {
    openaiKeyInput.value = saved.openaiKey;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const openaiKey = openaiKeyInput.value.trim();
    
    await chrome.storage.sync.set({ openaiKey });
    
    successMessage.classList.add('show');
    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 3000);
  });
});

