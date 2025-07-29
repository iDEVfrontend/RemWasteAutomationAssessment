// Test Configuration and Utilities
// Provides flexible configuration for different test environments

class TestConfig {
  
  static getApiBaseUrl() {
    // Priority: Environment variable > Cypress env > Detected working URL > Default fallback
    return process.env.API_BASE_URL || 
           Cypress.env('API_BASE_URL') || 
           'https://remwasteapp-backend.onrender.com' ||  // Actual deployed URL from frontend config
           'https://remwaste-backend.onrender.com' ||     // URL from deployment docs
           'http://localhost:5000';                       // Local fallback
  }

  static isRemoteService() {
    return this.getApiBaseUrl().includes('onrender.com');
  }

  static isLocalService() {
    return this.getApiBaseUrl().includes('localhost');
  }

  static getServiceInfo() {
    return {
      baseUrl: this.getApiBaseUrl(),
      isRemote: this.isRemoteService(),
      isLocal: this.isLocalService(),
      serviceType: this.isRemoteService() ? 'Remote (Render)' : 'Local Development'
    };
  }

  static logServiceInfo() {
    const info = this.getServiceInfo();
    cy.log(`🔗 API Service: ${info.serviceType}`);
    cy.log(`🌐 Base URL: ${info.baseUrl}`);
    
    if (info.isRemote) {
      cy.log('⚠️ Note: Remote service may sleep and need warming up');
    }
  }

  // Test data configuration
  static getTestConfig() {
    return {
      timeouts: {
        default: this.isRemoteService() ? 30000 : 10000,
        warmup: 60000,
        fail: 15000
      },
      retries: {
        health: this.isRemoteService() ? 3 : 1,
        auth: 2,
        crud: 2
      },
      delays: {
        serviceColdStart: 30000,
        betweenRequests: this.isRemoteService() ? 1000 : 500
      }
    };
  }

  // Mock service detection and handling
  static shouldUseMockService() {
    // Use mock service if both remote and local are unavailable
    return Cypress.env('USE_MOCK_SERVICE') === true;
  }

  static getMockApiResponse(endpoint, method = 'GET') {
    const mockResponses = {
      'GET /health': {
        status: 'OK',
        message: 'RemWaste API is running (MOCK)',
        environment: 'test',
        database: 'Mock Database',
        timestamp: new Date().toISOString()
      },
      'GET /': {
        message: 'RemWaste API - Waste Management System (MOCK)',
        version: '1.0.0',
        database: 'Mock Database',
        endpoints: {
          health: '/health',
          auth: { register: 'POST /register', login: 'POST /login' },
          items: { getAll: 'GET /items', create: 'POST /items' }
        }
      }
    };

    const key = `${method} ${endpoint}`;
    return mockResponses[key] || { message: 'Mock response', endpoint, method };
  }
}

export default TestConfig;
