const OpenRouterService = {
  API_KEY: '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',
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'google/gemma-3-27b-it:free',

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
      
      const prompt = `Generate a concise SEO meta description (maximum 160 characters) for this article:
Title: "${articleTitle}"
${articleSubtitle ? `Subtitle: "${articleSubtitle}"` : ''}
${contentPreview ? `\nContent Preview: "${contentPreview}..."` : ''}

Return ONLY the description text, nothing else.`;

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
              content: 'You are an expert SEO copywriter. Write compelling meta descriptions that improve search rankings. Rules: NO emojis, NO hashtags, NO colons at the start, NO quotes. Use action words, include keywords naturally, create urgency or value. Focus on benefits and clarity. Maximum 160 characters. Start directly with engaging content.'
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
      
      const prompt = `Generate a short, descriptive alt text (maximum 125 characters) for the featured image of this article:
"${articleTitle}"

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
              content: 'You are an accessibility and SEO expert. Generate descriptive image alt text for featured blog images. Rules: NO emojis, NO hashtags, NO quotes. Be specific and descriptive. Include relevant keywords naturally. Maximum 125 characters. Describe what the image would show for the alt text. The alt text should be a single sentence that describes the image.'
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

