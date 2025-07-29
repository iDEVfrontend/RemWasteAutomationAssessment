// Health API Tests - POM Structure
// Tests system health and documentation endpoints

import HealthApiService from '../../api/services/HealthApiService.js';

describe('RemWaste API - Health & System Tests (POM)', () => {
  let healthApi;

  before(() => {
    healthApi = new HealthApiService();
  });

  describe('System Health', () => {
    it('Should return healthy system status', () => {
      healthApi.getHealthStatus().then(response => {
        cy.log('✅ Health check passed');
        cy.log(`Environment: ${response.body.environment}`);
        cy.log(`Database: ${response.body.database}`);
      });
    });
  });

  describe('API Documentation', () => {
    it('Should return complete API documentation', () => {
      healthApi.getApiDocumentation().then(response => {
        cy.log('✅ API documentation retrieved');
        cy.log(`API Version: ${response.body.version}`);
        cy.log(`Available endpoints: ${Object.keys(response.body.endpoints).length}`);
      });
    });
  });

  describe('Error Handling', () => {
    it('Should handle invalid endpoints with 404', () => {
      healthApi.testInvalidEndpoint().then(response => {
        cy.log('✅ 404 error handling verified');
      });
    });
  });
});
