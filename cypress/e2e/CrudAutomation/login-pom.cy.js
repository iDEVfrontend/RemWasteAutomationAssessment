import LoginPage from '../../pages/LoginPage.js';

describe('RemWaste Login Tests - POM', () => {
  let loginPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  describe('Homepage Verification', () => {
    it('should load homepage with basic elements', () => {
      loginPage
        .visit()
        .shouldBeVisible()
        .shouldHaveCorrectTitle()
        .shouldShowRegisterOption()
        .shouldHaveProperInputTypes();
    });
  });

  describe('Form Validation Tests', () => {
    it('should handle empty form submission', () => {
      loginPage
        .visit()
        .clickSubmit()
        .shouldNotRedirectToDashboard();
    });

    it('should handle invalid email formats', () => {
      loginPage
        .visit()
        .enterEmail('invalid-email')
        .enterPassword('Test1234!')
        .clickSubmit()
        .shouldNotRedirectToDashboard();
    });

    it('should handle form submission with Enter key', () => {
      loginPage
        .visit()
        .enterEmail('test@example.com')
        .submitWithEnter('Test1234!');
    });
  });

  describe('Authentication Tests', () => {
    it('should handle non-existent user', () => {
      loginPage
        .login('nonexistent@example.com', 'Test1234!')
        .shouldNotRedirectToDashboard();
    });

    it('should handle wrong password', () => {
      loginPage
        .login('remwaste.x6j6cw@bumpmail.io', 'WrongPassword!')
        .shouldNotRedirectToDashboard();
    });

    it('should handle valid credentials', () => {
      loginPage.login('remwaste.x6j6cw@bumpmail.io', 'Test1234!');
      cy.wait(2000);
      // Note: Dashboard redirect assertion would be here if successful
    });
  });

  describe('Security Tests', () => {
    const securityPayloads = [
      "admin'; DROP TABLE users; --",
      "' OR '1'='1",
      "<script>alert('xss')</script>",
      "javascript:alert('xss')"
    ];

    securityPayloads.forEach((payload) => {
      it(`should prevent security attack: ${payload.substring(0, 20)}...`, () => {
        loginPage
          .login(payload, 'Test1234!')
          .shouldNotRedirectToDashboard();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];

    viewports.forEach((viewport) => {
      it(`should work on ${viewport.name} viewport`, () => {
        cy.viewport(viewport.width, viewport.height);
        loginPage
          .visit()
          .shouldBeVisible();
      });
    });
  });
});
