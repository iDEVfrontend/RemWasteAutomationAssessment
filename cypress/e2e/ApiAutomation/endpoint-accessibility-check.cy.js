// Endpoint Accessibility Checker
// Tests which RemWaste API endpoints are accessible and diagnoses issues

describe('🔍 RemWaste API Endpoint Accessibility Check', () => {
  const possibleBaseUrls = [
    'https://remwasteapp-backend.onrender.com',  // From frontend config
    'https://remwaste-backend.onrender.com',     // From deployment docs
    'http://localhost:5000'                      // Local development
  ];

  possibleBaseUrls.forEach((baseUrl, index) => {
    describe(`Testing Base URL ${index + 1}: ${baseUrl}`, () => {
      
      it('Health Check - GET /health', () => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/health`,
          timeout: 30000,
          failOnStatusCode: false,
          retryOnStatusCodeFailure: false
        }).then((response) => {
          cy.log(`🔗 ${baseUrl}/health`);
          cy.log(`📊 Status: ${response.status}`);
          cy.log(`📄 Response: ${JSON.stringify(response.body)}`);
          
          if (response.status === 200) {
            cy.log('✅ Health endpoint is accessible');
            expect(response.body).to.have.property('status');
          } else if (response.status === 404) {
            cy.log('❌ Service not found - may be incorrectly deployed or sleeping');
          } else if (response.status >= 500) {
            cy.log('⚠️ Server error - service may be starting up');
          } else {
            cy.log(`⚠️ Unexpected status: ${response.status}`);
          }
        });
      });

      it('API Documentation - GET /', () => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/`,
          timeout: 30000,
          failOnStatusCode: false,
          retryOnStatusCodeFailure: false
        }).then((response) => {
          cy.log(`🔗 ${baseUrl}/`);
          cy.log(`📊 Status: ${response.status}`);
          
          if (response.status === 200) {
            cy.log('✅ API documentation endpoint is accessible');
            if (response.body && response.body.message) {
              cy.log(`📝 API Message: ${response.body.message}`);
            }
          } else {
            cy.log(`❌ API documentation not accessible: ${response.status}`);
          }
        });
      });

      it('Registration Test - POST /register', () => {
        const testUser = {
          email: `test.${Date.now()}@accessibility.test`,
          password: 'TestPassword123!'
        };

        cy.request({
          method: 'POST',
          url: `${baseUrl}/register`,
          body: testUser,
          timeout: 30000,
          failOnStatusCode: false,
          retryOnStatusCodeFailure: false
        }).then((response) => {
          cy.log(`🔗 ${baseUrl}/register`);
          cy.log(`📊 Status: ${response.status}`);
          
          if (response.status === 201) {
            cy.log('✅ Registration endpoint is working');
          } else if (response.status === 404) {
            cy.log('❌ Registration endpoint not found');
          } else if (response.status >= 400) {
            cy.log(`⚠️ Registration endpoint responding but with error: ${response.status}`);
            cy.log(`📄 Error: ${JSON.stringify(response.body)}`);
          }
        });
      });

      it('Invalid Endpoint Test - GET /invalid', () => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/invalid`,
          timeout: 15000,
          failOnStatusCode: false,
          retryOnStatusCodeFailure: false
        }).then((response) => {
          cy.log(`🔗 ${baseUrl}/invalid`);
          cy.log(`📊 Status: ${response.status}`);
          
          if (response.status === 404 && response.body && response.body.error === 'Route not found') {
            cy.log('✅ Service is running - proper 404 handling detected');
          } else if (response.status === 404) {
            cy.log('❌ Service may not be running - generic 404');
          } else {
            cy.log(`⚠️ Unexpected response for invalid endpoint: ${response.status}`);
          }
        });
      });
    });
  });

  describe('🚨 Service Status Summary', () => {
    it('Should provide diagnosis and recommendations', () => {
      cy.log('🔍 ENDPOINT ACCESSIBILITY DIAGNOSIS:');
      cy.log('');
      cy.log('1. Check above test results for each base URL');
      cy.log('2. Look for ✅ indicators showing working endpoints');
      cy.log('3. Common issues and solutions:');
      cy.log('');
      cy.log('❌ 404 Not Found:');
      cy.log('   - Service may not be deployed');
      cy.log('   - Wrong URL (check deployment config)');
      cy.log('   - Service sleeping (Render free tier)');
      cy.log('');
      cy.log('⚠️ 500+ Server Errors:');
      cy.log('   - Service starting up (wait 30-60 seconds)');
      cy.log('   - Database connection issues');
      cy.log('   - Environment variable problems');
      cy.log('');
      cy.log('🔄 Service Sleeping (Render Free Tier):');
      cy.log('   - Free services sleep after 15 minutes of inactivity');
      cy.log('   - First request may take 30-60 seconds to wake up');
      cy.log('   - Multiple requests may be needed');
      cy.log('');
      cy.log('🎯 RECOMMENDATIONS:');
      cy.log('1. Use working base URL for API automation');
      cy.log('2. Implement service warm-up in tests');
      cy.log('3. Add retry logic for sleeping services');
      cy.log('4. Consider upgrading to paid plan for production');
      
      expect(true).to.be.true; // Always pass to show diagnosis
    });
  });
});
