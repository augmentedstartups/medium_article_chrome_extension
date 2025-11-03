const TestData = {
  async getTestArticle() {
    const testImageURL = chrome.runtime.getURL('assets/ritz_cta.png');
    
    const response = await fetch(testImageURL);
    const blob = await response.blob();
    const dataURL = await this.blobToDataURL(blob);
    
    return {
      title: 'Test Article: LinkedIn Upload Validation',
      subtitle: 'Testing sequential text and image insertion',
      content: [
        {
          type: 'p',
          content: 'This is the first paragraph of our test article. It contains some introductory text to verify that text insertion works correctly.'
        },
        {
          type: 'image',
          dataURL: dataURL,
          alt: 'Test Image 1',
          caption: 'First test image'
        },
        {
          type: 'p',
          content: 'This is the second paragraph, appearing after the first image. This tests the text-image-text pattern.'
        },
        {
          type: 'h2',
          content: 'Section Heading'
        },
        {
          type: 'p',
          content: 'Here is another paragraph with more content. This helps us verify that multiple text blocks work properly between images.'
        },
        {
          type: 'image',
          dataURL: dataURL,
          alt: 'Test Image 2',
          caption: 'Second test image'
        },
        {
          type: 'p',
          content: 'Final paragraph after the second image. This completes our test pattern of text and images.'
        },
        {
          type: 'image',
          dataURL: dataURL,
          alt: 'Test Image 3',
          caption: 'Third test image'
        },
        {
          type: 'p',
          content: 'Conclusion paragraph to wrap up the test article.'
        },
        {
          type: 'p',
          content: ''
        }
      ],
      images: [
        {
          dataURL: dataURL,
          original: testImageURL,
          alt: 'Test Image'
        }
      ]
    };
  },
  
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};

