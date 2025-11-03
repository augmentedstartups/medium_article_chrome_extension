const OpenRouterService = {
  API_KEY: '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',
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'google/gemma-3-27b-it:free',
  DESCRIPTION_PROMPT: 'You are an expert SEO copywriter. Write a compelling meta description that improves search rankings. CRITICAL RULES: 1) DO NOT just repeat the title 2) NO emojis, NO hashtags, NO colons, NO quotes 3) Use action words and power verbs 4) Include main keywords naturally 5) Create urgency or highlight value proposition 6) Focus on benefits and what readers will learn 7) Maximum 160 characters 8) Must be different from the title. Generate an engaging description that makes people want to click.',
  ALT_TEXT_PROMPT: 'You are an accessibility and SEO expert. Generate descriptive alt text for the article hero image. CRITICAL RULES: 1) DO NOT use phrases like "featured image", "image of", "picture of" 2) NO emojis, NO hashtags, NO quotes 3) Describe what is visually shown in the image 4) Be specific and descriptive 5) Include relevant keywords naturally 6) Maximum 125 characters 7) Write as if describing the image to someone who cannot see it. Just describe the visual content directly.',
  
  async init() {
    await this.reloadSettings();
  },
  
  async reloadSettings() {
    const stored = await chrome.storage.local.get(['openRouterSettings']);
    if (stored.openRouterSettings) {
      this.API_KEY = stored.openRouterSettings.apiKey || this.API_KEY;
      this.MODEL = stored.openRouterSettings.model || this.MODEL;
      this.DESCRIPTION_PROMPT = stored.openRouterSettings.descriptionPrompt || this.DESCRIPTION_PROMPT;
      this.ALT_TEXT_PROMPT = stored.openRouterSettings.altTextPrompt || this.ALT_TEXT_PROMPT;
      console.log('[OpenRouter] Settings reloaded - Model:', this.MODEL);
    }
  },

  async generatePageDescription(articleTitle, articleSubtitle = '', articleContent = '') {
    try {
      console.log('[OpenRouter] Generating page description for:', articleTitle);
      
      let contentPreview = '';
      if (articleContent && articleContent.trim()) {
        const cleanContent = articleContent
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        contentPreview = cleanContent.substring(0, 500);
        console.log('[OpenRouter] Using article content for context (500 chars)');
      }
      
      const prompt = `Write a compelling SEO meta description for this article. The description MUST be different from the title and should highlight key benefits or insights.

Title: "${articleTitle}"
${articleSubtitle ? `Subtitle: "${articleSubtitle}"` : ''}
${contentPreview ? `\nContent Preview: "${contentPreview}..."` : ''}

Requirements:
- Maximum 160 characters
- Must NOT just repeat the title
- Focus on what readers will learn or gain
- Use action words
- Make it click-worthy

Return ONLY the meta description, nothing else.`;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medium Article Publisher'
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: this.DESCRIPTION_PROMPT
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let description = data.choices[0].message.content.trim();
      
      description = description.replace(/^["':]+|["':]+$/g, '');
      description = description.replace(/[:#]/g, '');
      description = description.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      
      const truncated = description.substring(0, 160).trim();
      
      console.log('[OpenRouter] Generated description:', truncated);
      return truncated;

    } catch (error) {
      console.error('[OpenRouter] Failed to generate description:', error);
      throw error;
    }
  },

  async generateImageAltText(articleTitle) {
    try {
      console.log('[OpenRouter] Generating image alt text for:', articleTitle);
      
      const prompt = `Generate descriptive alt text for the hero/cover image of this article: "${articleTitle}"

The alt text should:
- Describe what is visually shown in a typical article header image for this topic
- NOT use phrases like "featured image", "image of", "picture of"
- Be specific and descriptive
- Maximum 125 characters
- Help visually impaired readers understand the image content

Examples of good alt text:
- "Developer working on RAG agent code with AI models"
- "Business dashboard showing revenue growth metrics"
- "Automated workflow diagram with n8n integration"

Return ONLY the alt text, nothing else.`;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medium Article Publisher'
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: this.ALT_TEXT_PROMPT
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let altText = data.choices[0].message.content.trim();
      
      altText = altText.replace(/^["':]+|["':]+$/g, '');
      altText = altText.replace(/[:#]/g, '');
      altText = altText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
      
      const truncated = altText.substring(0, 125).trim();
      
      console.log('[OpenRouter] Generated alt text:', truncated);
      return truncated;

    } catch (error) {
      console.error('[OpenRouter] Failed to generate alt text:', error);
      throw error;
    }
  },

  async testConnection() {
    try {
      console.log('[OpenRouter] Testing API connection...');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medium Article Publisher'
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from OpenRouter!"'
            }
          ],
          max_tokens: 20
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API test failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[OpenRouter] ✅ Connection test successful:', data.choices[0].message.content);
      return { success: true, message: data.choices[0].message.content };

    } catch (error) {
      console.error('[OpenRouter] ❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
};

if (typeof chrome !== 'undefined' && chrome.storage) {
  OpenRouterService.init();
}

