const Config = {
  delays: {
    newTabWait: 4000,
    existingTabWait: 2500,
    
    titleToEditor: 500,
    editorReady: 500,
    
    afterPasteCheck: 500,
    betweenRetries: 1000,
    afterInsertAttempt: 300,
    
    beforeCoverUpload: 1000,
    afterButtonClick: 500,
    afterFileInput: 500,
    afterFileUpload: 2000,
    afterNextButton: 1000
  },
  
  speedProfiles: {
    fast: {
      newTabWait: 2500,
      existingTabWait: 1500,
      titleToEditor: 200,
      editorReady: 300,
      afterPasteCheck: 300,
      betweenRetries: 500,
      afterInsertAttempt: 200,
      beforeCoverUpload: 500,
      afterButtonClick: 300,
      afterFileInput: 300,
      afterFileUpload: 1000,
      afterNextButton: 500
    },
    
    normal: {
      newTabWait: 4000,
      existingTabWait: 2500,
      titleToEditor: 500,
      editorReady: 500,
      afterPasteCheck: 500,
      betweenRetries: 1000,
      afterInsertAttempt: 300,
      beforeCoverUpload: 1000,
      afterButtonClick: 500,
      afterFileInput: 500,
      afterFileUpload: 2000,
      afterNextButton: 1000
    },
    
    slow: {
      newTabWait: 6000,
      existingTabWait: 4000,
      titleToEditor: 800,
      editorReady: 800,
      afterPasteCheck: 800,
      betweenRetries: 1500,
      afterInsertAttempt: 500,
      beforeCoverUpload: 1500,
      afterButtonClick: 800,
      afterFileInput: 800,
      afterFileUpload: 3000,
      afterNextButton: 1500
    }
  },
  
  setProfile(profileName) {
    const profile = this.speedProfiles[profileName];
    if (profile) {
      Object.assign(this.delays, profile);
      console.log(`[Config] Speed profile set to: ${profileName}`);
      console.log('[Config] Current delays:', this.delays);
    } else {
      console.error(`[Config] Unknown profile: ${profileName}`);
    }
  }
};

Config.setProfile('fast');







