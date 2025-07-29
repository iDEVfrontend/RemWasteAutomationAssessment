// Custom Commands for RemWaste Login Testing

// Enhanced modal assertion command
Cypress.Commands.add("assertModalClosed", () => {
  cy.get("body").then(($body) => {
    const visibleModals = $body.find(".modal:visible, .modal.show, .modal.open");
    if (visibleModals.length > 0) {
      cy.get(".modal").should("not.be.visible");
    } else {
      cy.log("✅ Modal is closed (not present in DOM or not visible)");
    }
  });
});

// Enhanced modal assertion for specific modal types
Cypress.Commands.add("assertModalState", (shouldBeVisible = false) => {
  cy.get("body").then(($body) => {
    if ($body.find(".modal").length > 0) {
      if (shouldBeVisible) {
        cy.get(".modal").should("be.visible");
      } else {
        cy.get(".modal").should("not.be.visible");
      }
    } else {
      if (shouldBeVisible) {
        cy.log("❌ Modal should be visible but doesn't exist");
        throw new Error("Expected modal to be visible but modal element not found");
      } else {
        cy.log("✅ Modal is properly closed (not in DOM)");
      }
    }
  });
});

// Simple page readiness check
Cypress.Commands.add("checkPageReady", (context = "page") => {
  cy.get('body').should('exist').then(() => {
    cy.log(`✅ ${context} is loaded and ready`);
  });
});

// Enhanced login command
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  
  if (email) {
    cy.get('input[name="email"]').clear().type(email);
  }
  if (password) {
    cy.get('input[name="password"]').clear().type(password);
  }
  
  cy.get('button[type="submit"]').click();
});

// Clear all application data
Cypress.Commands.add("clearAppData", () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
  cy.clearAllSessionStorage();
});

// Check for console errors
Cypress.Commands.add("checkConsoleErrors", () => {
  cy.window().then((win) => {
    expect(win.console.error).to.not.have.been.called;
  });
});

// Test responsive design quickly
Cypress.Commands.add("testResponsive", (viewports = []) => {
  const defaultViewports = [
    [375, 667],   // Mobile
    [768, 1024],  // Tablet
    [1280, 720]   // Desktop
  ];
  
  const viewportsToTest = viewports.length > 0 ? viewports : defaultViewports;
  
  viewportsToTest.forEach((viewport) => {
    cy.viewport(viewport[0], viewport[1]);
    cy.get("body").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });
});

// Verify authentication state
Cypress.Commands.add("verifyAuthenticated", () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.not.be.null;
    expect(win.localStorage.getItem("user")).to.not.be.null;
  });
  cy.url().should("include", "/dashboard");
});

// Verify not authenticated
Cypress.Commands.add("verifyNotAuthenticated", () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.be.null;
    expect(win.localStorage.getItem("user")).to.be.null;
  });
  cy.url().should("not.include", "/dashboard");
});

// Wait for page to be ready
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.get('input[name="email"]').should("be.visible");
  cy.get('input[name="password"]').should("be.visible");
});

// Test security inputs
Cypress.Commands.add("testSecurityInput", (inputType, testValues) => {
  testValues.forEach((value) => {
    cy.get('input[name="email"]').clear().type(value);
    cy.get('input[name="password"]').clear().type("Test1234!");
    cy.get('button[type="submit"]').click();
    
    // Should not succeed
    cy.url().should("not.include", "/dashboard");
    
    // Should show error or remain on login page
    cy.get("body").should("be.visible");
  });
});

// Create test item command for dashboard testing (logs in first)
Cypress.Commands.add("createTestItem", (itemData = {}) => {
  const {
    title = `Test Item ${Date.now()}`,
    description = "Test description",
    location = "Test Location",
    weight = "10",
    status = "pending"
  } = itemData;
  
  // Ensure we're on dashboard
  cy.visit("/dashboard");
  cy.url().should("include", "/dashboard");
  
  // Click add new item button
  cy.contains(/add.*new.*item|add.*item|create.*item/i).click();
  
  // Fill title (required field)
  cy.get('input[name="title"], input[placeholder*="title"], input[id*="title"]')
    .clear()
    .type(title);
  
  // Fill description if field exists
  cy.get("body").then(($body) => {
    if ($body.find('textarea[name="description"], textarea[placeholder*="description"]').length > 0) {
      cy.get('textarea[name="description"], textarea[placeholder*="description"]')
        .clear()
        .type(description);
    } else if ($body.find('input[name="description"], input[placeholder*="description"]').length > 0) {
      cy.get('input[name="description"], input[placeholder*="description"]')
        .clear()
        .type(description);
    }
  });
  
  // Fill location if field exists
  cy.get("body").then(($body) => {
    if ($body.find('input[name="location"], input[placeholder*="location"]').length > 0) {
      cy.get('input[name="location"], input[placeholder*="location"]')
        .clear()
        .type(location);
    }
  });
  
  // Fill weight if field exists
  cy.get("body").then(($body) => {
    if ($body.find('input[name="weight"], input[placeholder*="weight"]').length > 0) {
      cy.get('input[name="weight"], input[placeholder*="weight"]')
        .clear()
        .type(weight);
    }
  });
  
  // Set status if field exists
  cy.get("body").then(($body) => {
    if ($body.find('select[name="status"]').length > 0) {
      cy.get('select[name="status"]').select(status);
    }
  });
  
  // Submit form using the correct selector with force: true
  cy.get('.modal-footer > .fw-semibold, button[type="submit"]')
    .contains(/add|create|save|submit/i)
    .click({ force: true });
  
  // Verify item was created
  cy.contains(title, { timeout: 10000 }).should("be.visible");
});

// Create test item in same session (no navigation/login)
Cypress.Commands.add("createTestItemInSameSession", (itemData = {}) => {
  const {
    title = `Session Item ${Date.now()}`,
    description = "Test description",
    location = "Test Location",
    weight = "10"
  } = itemData;
  
  // Click add new item button
  cy.contains(/add.*new.*item|add.*item|create.*item/i).click();
  
  // Wait for modal to be visible
  cy.get(".modal, .form").should("be.visible");
  
  // Fill title (required field)
  cy.get('input[name="title"], input[placeholder*="title"], input[id*="title"]')
    .clear()
    .type(title);
  
  // Fill description if field exists
  cy.get("body").then(($body) => {
    if ($body.find('textarea[name="description"], textarea[placeholder*="description"]').length > 0) {
      cy.get('textarea[name="description"], textarea[placeholder*="description"]')
        .clear()
        .type(description);
    } else if ($body.find('input[name="description"], input[placeholder*="description"]').length > 0) {
      cy.get('input[name="description"], input[placeholder*="description"]')
        .clear()
        .type(description);
    }
  });
  
  // Fill location if field exists
  cy.get("body").then(($body) => {
    if ($body.find('input[name="location"], input[placeholder*="location"]').length > 0) {
      cy.get('input[name="location"], input[placeholder*="location"]')
        .clear()
        .type(location);
    }
  });
  
  // Fill weight if field exists
  cy.get("body").then(($body) => {
    if ($body.find('input[name="weight"], input[placeholder*="weight"]').length > 0) {
      cy.get('input[name="weight"], input[placeholder*="weight"]')
        .clear()
        .type(weight);
    }
  });
  
  // Submit form using the correct selector with force: true to bypass modal overlay
  cy.get('.modal-footer > .fw-semibold')
    .contains(/add|create|save|submit/i)
    .click({ force: true });
  
  // Wait for modal to close and item to appear
  cy.assertModalClosed();
  cy.contains(title, { timeout: 10000 }).should("be.visible");
});