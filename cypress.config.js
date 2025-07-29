const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Base URL for the application
    baseUrl: "https://remwasteapp-frontend.onrender.com/",
    
    // Basic configuration
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Test isolation
    testIsolation: true,
    
    // Environment variables
    env: {
      testEmail: "remwaste.x6j6cw@bumpmail.io",
      testPassword: "Test1234!"
    },
    
    setupNodeEvents(on, config) {
      // Browser launch options for cross-platform testing
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });
      
      // Simple logging task
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
  }
});