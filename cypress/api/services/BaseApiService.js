// Base API Service Class
// Provides common functionality for all API services

class BaseApiService {
  constructor() {
    // Use environment variable or default to the correct Render service URL
    this.baseUrl = Cypress.env('API_BASE_URL') || 'https://remwasteapp-backend.onrender.com';
    this.defaultTimeout = 30000; // Increased for sleeping services
    this.failTimeout = 15000;
    this.warmupTimeout = 60000; // Extra time for service warming
  }

  // Warm up sleeping service (Render free tier)
  warmUpService() {
    cy.log('🔥 Warming up sleeping service...');
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}/health`,
      timeout: this.warmupTimeout,
      failOnStatusCode: false,
      retryOnNetworkFailure: true
    }).then(response => {
      if (response.status === 404) {
        cy.log('⚠️ Service appears to be sleeping. Retrying in 30 seconds...');
        cy.wait(30000);
        return cy.request({
          method: 'GET',
          url: `${this.baseUrl}/health`,
          timeout: this.warmupTimeout,
          failOnStatusCode: false
        });
      }
      return response;
    });
  }

  // Standard GET request
  get(endpoint, options = {}) {
    return cy.request({
      method: 'GET',
      url: `${this.baseUrl}${endpoint}`,
      timeout: options.timeout || this.defaultTimeout,
      headers: options.headers || {},
      failOnStatusCode: options.failOnStatusCode !== false
    });
  }

  // Standard POST request
  post(endpoint, body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}${endpoint}`,
      body: body,
      timeout: options.timeout || this.defaultTimeout,
      headers: options.headers || {},
      failOnStatusCode: options.failOnStatusCode !== false
    });
  }

  // Standard PUT request
  put(endpoint, body, options = {}) {
    return cy.request({
      method: 'PUT',
      url: `${this.baseUrl}${endpoint}`,
      body: body,
      timeout: options.timeout || this.defaultTimeout,
      headers: options.headers || {},
      failOnStatusCode: options.failOnStatusCode !== false
    });
  }

  // Standard DELETE request
  delete(endpoint, options = {}) {
    return cy.request({
      method: 'DELETE',
      url: `${this.baseUrl}${endpoint}`,
      timeout: options.timeout || this.defaultTimeout,
      headers: options.headers || {},
      failOnStatusCode: options.failOnStatusCode !== false
    });
  }

  // Create authorization header
  createAuthHeader(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Common response validation
  validateResponse(response, expectedStatus = 200) {
    expect(response.status).to.eq(expectedStatus);
    expect(response.headers['content-type']).to.include('application/json');
    return response;
  }

  // Generate unique test data
  generateUniqueEmail() {
    const timestamp = Date.now();
    return `test.api.${timestamp}@remwaste.test`;
  }

  generateTestPassword() {
    return 'TestPassword123!';
  }
}

export default BaseApiService;
