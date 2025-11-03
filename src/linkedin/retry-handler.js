const RetryHandler = {
  maxAttempts: 3,
  delayMs: 2000,

  async executeWithRetry(fn, context = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        console.log(`[Retry Handler] Attempt ${attempt}/${this.maxAttempts} for ${context}`);
        const result = await fn();
        console.log(`[Retry Handler] ${context} succeeded on attempt ${attempt}`);
        return { success: true, result, attempt };
      } catch (error) {
        lastError = error;
        console.error(`[Retry Handler] ${context} failed on attempt ${attempt}:`, error);
        
        if (attempt < this.maxAttempts) {
          console.log(`[Retry Handler] Waiting ${this.delayMs}ms before retry...`);
          await this.delay(this.delayMs);
        }
      }
    }
    
    return { 
      success: false, 
      error: lastError.message, 
      attempts: this.maxAttempts 
    };
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async verifyImagesLoaded(container) {
    await this.delay(1000);
    
    const images = container.querySelectorAll('img');
    let loadedCount = 0;
    let failedCount = 0;
    
    for (const img of images) {
      if (img.complete && img.naturalHeight !== 0) {
        loadedCount++;
      } else {
        failedCount++;
      }
    }
    
    console.log(`[Retry Handler] Image verification: ${loadedCount} loaded, ${failedCount} failed`);
    
    return {
      total: images.length,
      loaded: loadedCount,
      failed: failedCount,
      allLoaded: failedCount === 0
    };
  }
};

