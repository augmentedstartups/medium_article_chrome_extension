console.log('[Kajabi Settings] Initializing settings panel...');

const OPENROUTER_MODELS = [
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)' },
  { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B (Free)' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek Chat v3.1 (Free)' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2 (Free)' },
  { id: 'qwen/qwen3-30b-a3b:free', name: 'Qwen 3 30B (Free)' }
];

const DEFAULT_SETTINGS = {
  apiKey: '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',
  model: 'google/gemma-3-27b-it:free',
  descriptionPrompt: 'You are an expert SEO copywriter. Write a compelling meta description that improves search rankings. CRITICAL RULES: 1) DO NOT just repeat the title 2) NO emojis, NO hashtags, NO colons, NO quotes 3) Use action words and power verbs 4) Include main keywords naturally 5) Create urgency or highlight value proposition 6) Focus on benefits and what readers will learn 7) Maximum 160 characters 8) Must be different from the title. Generate an engaging description that makes people want to click.',
  altTextPrompt: 'You are an accessibility and SEO expert. Generate descriptive alt text for the article hero image. CRITICAL RULES: 1) DO NOT use phrases like "featured image", "image of", "picture of" 2) NO emojis, NO hashtags, NO quotes 3) Describe what is visually shown in the image 4) Be specific and descriptive 5) Include relevant keywords naturally 6) Maximum 125 characters 7) Write as if describing the image to someone who cannot see it. Just describe the visual content directly.'
};

class KajabiSettingsPanel {
  constructor() {
    this.isOpen = false;
    this.settings = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.injectSettingsButton();
  }

  async loadSettings() {
    const stored = await chrome.storage.local.get(['openRouterSettings']);
    this.settings = stored.openRouterSettings || DEFAULT_SETTINGS;
    console.log('[Kajabi Settings] Loaded settings:', this.settings);
  }

  async saveSettings() {
    await chrome.storage.local.set({ openRouterSettings: this.settings });
    console.log('[Kajabi Settings] Settings saved:', this.settings);
    
    await OpenRouterService.reloadSettings();
  }

  injectSettingsButton() {
    if (document.getElementById('kajabi-settings-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'kajabi-settings-btn';
    button.innerHTML = '⚙️';
    button.title = 'AI Settings';
    button.style.cssText = `
      position: fixed;
      top: 180px;
      right: 20px;
      z-index: 999999;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #6B7280 0%, #374151 100%);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1) rotate(90deg)';
      button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1) rotate(0deg)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });

    button.addEventListener('click', () => {
      this.togglePanel();
    });

    document.body.appendChild(button);
    console.log('[Kajabi Settings] ✅ Settings button injected');
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    if (document.getElementById('kajabi-settings-panel')) {
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'kajabi-settings-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000000;
      width: 600px;
      max-height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🤖 AI Settings</h2>
        <button id="close-settings" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px;">×</button>
      </div>
      
      <div style="padding: 20px; max-height: calc(80vh - 140px); overflow-y: auto;">
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
            OpenRouter API Key
          </label>
          <input id="api-key-input" type="password" placeholder="sk-or-v1-..." style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 14px; font-family: monospace;" value="${this.settings.apiKey || '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'}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
            <p style="font-size: 12px; color: #6B7280; margin: 0;">Get your API key from <a href="https://openrouter.ai/keys" target="_blank" style="color: #667eea;">openrouter.ai/keys</a></p>
            <button id="test-api-key" style="padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Test API Key</button>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
            OpenRouter Model
          </label>
          <select id="model-select" style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 14px; background: white;">
            ${OPENROUTER_MODELS.map(model => `
              <option value="${model.id}" ${model.id === this.settings.model ? 'selected' : ''}>
                ${model.name}
              </option>
            `).join('')}
          </select>
          <p style="font-size: 12px; color: #6B7280; margin-top: 5px;">Select the AI model to use for generation</p>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
            SEO Description Prompt
          </label>
          <textarea id="description-prompt" rows="6" style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-family: monospace; resize: vertical;">${this.settings.descriptionPrompt}</textarea>
          <p style="font-size: 12px; color: #6B7280; margin-top: 5px;">System prompt for generating meta descriptions</p>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
            Image Alt Text Prompt
          </label>
          <textarea id="alttext-prompt" rows="6" style="width: 100%; padding: 10px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 13px; font-family: monospace; resize: vertical;">${this.settings.altTextPrompt}</textarea>
          <p style="font-size: 12px; color: #6B7280; margin-top: 5px;">System prompt for generating image alt text</p>
        </div>

      </div>

      <div style="padding: 20px; border-top: 2px solid #E5E7EB; display: flex; gap: 10px; justify-content: flex-end;">
        <button id="reset-settings" style="padding: 10px 20px; background: #EF4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Reset to Defaults
        </button>
        <button id="save-settings" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Save Settings
        </button>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'kajabi-settings-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    document.getElementById('close-settings').addEventListener('click', () => this.closePanel());
    overlay.addEventListener('click', () => this.closePanel());
    
    document.getElementById('save-settings').addEventListener('click', () => this.handleSave());
    document.getElementById('reset-settings').addEventListener('click', () => this.handleReset());
    document.getElementById('test-api-key').addEventListener('click', () => this.handleTestAPI());

    this.isOpen = true;
    console.log('[Kajabi Settings] Panel opened');
  }

  closePanel() {
    const panel = document.getElementById('kajabi-settings-panel');
    const overlay = document.getElementById('kajabi-settings-overlay');
    
    if (panel) panel.remove();
    if (overlay) overlay.remove();
    
    this.isOpen = false;
    console.log('[Kajabi Settings] Panel closed');
  }

  async handleSave() {
    const apiKey = document.getElementById('api-key-input').value;
    const model = document.getElementById('model-select').value;
    const descriptionPrompt = document.getElementById('description-prompt').value;
    const altTextPrompt = document.getElementById('alttext-prompt').value;

    this.settings = {
      apiKey,
      model,
      descriptionPrompt,
      altTextPrompt
    };

    await this.saveSettings();

    const saveBtn = document.getElementById('save-settings');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✅ Saved!';
    saveBtn.style.background = '#10B981';

    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 2000);

    console.log('[Kajabi Settings] ✅ Settings saved');
  }

  async handleReset() {
    if (!confirm('Reset all settings to defaults?')) {
      return;
    }

    this.settings = { ...DEFAULT_SETTINGS };
    await this.saveSettings();

    document.getElementById('api-key-input').value = this.settings.apiKey;
    document.getElementById('model-select').value = this.settings.model;
    document.getElementById('description-prompt').value = this.settings.descriptionPrompt;
    document.getElementById('alttext-prompt').value = this.settings.altTextPrompt;

    console.log('[Kajabi Settings] ✅ Settings reset to defaults');
  }

  async handleTestAPI() {
    const testBtn = document.getElementById('test-api-key');
    const originalText = testBtn.textContent;
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKey = apiKeyInput.value;

    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      alert('❌ Invalid API Key Format\n\nAPI key should start with "sk-or-v1-"');
      return;
    }

    try {
      testBtn.disabled = true;
      testBtn.textContent = '⏳ Testing...';
      testBtn.style.background = '#6B7280';

      const tempKey = OpenRouterService.API_KEY;
      OpenRouterService.API_KEY = apiKey;

      const result = await OpenRouterService.testConnection();

      OpenRouterService.API_KEY = tempKey;

      if (result.success) {
        testBtn.textContent = '✅ Valid!';
        testBtn.style.background = '#10B981';
        console.log('[Kajabi Settings] ✅ API key test successful:', result.message);
        
        setTimeout(() => {
          alert(`✅ API Key Valid!\n\nResponse: ${result.message}\n\nYou can now use this key for AI generation.`);
        }, 100);
      } else {
        throw new Error(result.error);
      }

      setTimeout(() => {
        testBtn.textContent = originalText;
        testBtn.style.background = '#10B981';
        testBtn.disabled = false;
      }, 3000);

    } catch (error) {
      console.error('[Kajabi Settings] ❌ API key test failed:', error);
      
      testBtn.textContent = '❌ Invalid';
      testBtn.style.background = '#EF4444';

      let errorMsg = error.message;
      if (errorMsg.includes('401')) {
        errorMsg = 'API key is invalid or expired. Please get a new one from openrouter.ai/keys';
      } else if (errorMsg.includes('403')) {
        errorMsg = 'API key does not have permission to access this model';
      } else if (errorMsg.includes('429')) {
        errorMsg = 'Rate limit exceeded. Please wait and try again';
      }

      alert(`❌ API Key Test Failed\n\n${errorMsg}\n\nPlease check your API key and try again.`);

      setTimeout(() => {
        testBtn.textContent = originalText;
        testBtn.style.background = '#10B981';
        testBtn.disabled = false;
      }, 3000);
    }
  }
}

let settingsPanel;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    settingsPanel = new KajabiSettingsPanel();
  });
} else {
  settingsPanel = new KajabiSettingsPanel();
}

setTimeout(() => {
  if (!settingsPanel) {
    settingsPanel = new KajabiSettingsPanel();
  }
}, 2000);

