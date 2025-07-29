// Global E2E Configuration for RemWaste Testing

// Import commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail on application errors that don't affect our tests
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Global beforeEach hook
beforeEach(() => {
  // Set consistent viewport
  cy.viewport(1280, 720);
  
  // Clear application data before each test
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
  cy.clearAllSessionStorage();
});

// Global afterEach hook
afterEach(() => {
  // Take screenshot on failure
  if (cy.state('runnable').state === 'failed') {
    const testName = Cypress.currentTest.title.replace(/[^a-z0-9]/gi, '_');
    cy.screenshot(`failed-${testName}`);
  }
});

// Set up console error monitoring
Cypress.Commands.add('setupConsoleErrorMonitoring', () => {
  cy.window().then((win) => {
    win.console.originalError = win.console.error;
    win.console.error = (...args) => {
      win.console.originalError.apply(win.console, args);
      // Don't fail tests on console errors, just log them
      cy.log(`Console Error: ${args.join(' ')}`);
    };
  });
});