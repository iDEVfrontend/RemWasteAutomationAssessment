// Health API Service
// Handles health check and system status endpoints

import BaseApiService from './BaseApiService.js';

class HealthApiService extends BaseApiService {
  
  // GET /health - Check system health
  getHealthStatus() {
    // First try to warm up the service
    return this.warmUpService().then(warmupResponse => {
      if (warmupResponse.status === 200) {
        return warmupResponse;
      } else {
        // Try the regular health check
        return this.get('/health', { 
          timeout: this.warmupTimeout,
          failOnStatusCode: false 
        });
      }
    }).then(response => {
      if (response.status !== 200) {
        throw new Error(`Health check failed: ${response.status} - Service may be sleeping or unavailable`);
      }
      
      this.validateResponse(response, 200);
      
      // Validate health response structure
      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('message', 'RemWaste API is running');
      expect(response.body).to.have.property('environment');
      expect(response.body).to.have.property('database');
      expect(response.body).to.have.property('timestamp');
      
      // Validate timestamp format
      expect(response.body.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      return response;
    });
  }

  // GET / - Get API documentation
  getApiDocumentation() {
    return this.get('/').then(response => {
      this.validateResponse(response, 200);
      
      // Validate API documentation structure
      expect(response.body).to.have.property('message', 'RemWaste API - Waste Management System');
      expect(response.body).to.have.property('version', '1.0.0');
      expect(response.body).to.have.property('database');
      expect(response.body).to.have.property('endpoints');
      
      // Validate endpoints structure
      expect(response.body.endpoints).to.have.property('health');
      expect(response.body.endpoints).to.have.property('auth');
      expect(response.body.endpoints).to.have.property('items');
      
      return response;
    });
  }

  // GET /invalid-endpoint - Test 404 handling
  testInvalidEndpoint() {
    return this.get('/invalid-endpoint', { 
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Route not found');
      return response;
    });
  }
}

export default HealthApiService;
