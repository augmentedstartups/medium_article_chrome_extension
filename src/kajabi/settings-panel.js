console.log('[Kajabi Settings] Initializing settings panel...');

const OPENROUTER_MODELS = [
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free)' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B (Free)' }
];

const DEFAULT_SETTINGS = {
  model: 'google/gemma-3-27b-it:free',
  descriptionPrompt: 'You are an expert SEO copywriter. Write compelling meta descriptions that improve search rankings. Rules: NO emojis, NO hashtags, NO colons at the start, NO quotes. Use action words, include keywords naturally, create urgency or value. Focus on benefits and clarity. Maximum 160 characters. Start directly with engaging content.',
  altTextPrompt: 'You are an accessibility and SEO expert. Generate descriptive image alt text for featured blog images. Rules: NO emojis, NO hashtags, NO quotes. Be specific and descriptive. Include relevant keywords naturally. Maximum 125 characters. Describe what the image would show for the alt text. The alt text should be a single sentence that describes the image.'
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
    const model = document.getElementById('model-select').value;
    const descriptionPrompt = document.getElementById('description-prompt').value;
    const altTextPrompt = document.getElementById('alttext-prompt').value;

    this.settings = {
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

    document.getElementById('model-select').value = this.settings.model;
    document.getElementById('description-prompt').value = this.settings.descriptionPrompt;
    document.getElementById('alttext-prompt').value = this.settings.altTextPrompt;

    console.log('[Kajabi Settings] ✅ Settings reset to defaults');
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

