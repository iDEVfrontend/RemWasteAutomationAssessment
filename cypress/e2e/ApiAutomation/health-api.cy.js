describe('RemWaste API - Health Check Tests', () => {
  const baseUrl = 'https://remwaste-backend.onrender.com';

  it('GET /health - Should return system health status', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/health`,
      timeout: 15000
    }).then((response) => {
      // Validate response status
      expect(response.status).to.eq(200);
      
      // Validate response headers
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.include('application/json');
      
      // Validate response body structure
      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('message', 'RemWaste API is running');
      expect(response.body).to.have.property('environment');
      expect(response.body).to.have.property('database');
      expect(response.body).to.have.property('timestamp');
      
      // Validate timestamp format (ISO string)
      expect(response.body.timestamp).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // Log response for debugging
      cy.log('Health Check Response:', JSON.stringify(response.body, null, 2));
    });
  });

  it('GET / - Should return API documentation', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/`,
      timeout: 15000
    }).then((response) => {
      // Validate response status
      expect(response.status).to.eq(200);
      
      // Validate response body structure
      expect(response.body).to.have.property('message', 'RemWaste API - Waste Management System');
      expect(response.body).to.have.property('version', '1.0.0');
      expect(response.body).to.have.property('database');
      expect(response.body).to.have.property('endpoints');
      
      // Validate endpoints structure
      expect(response.body.endpoints).to.have.property('health');
      expect(response.body.endpoints).to.have.property('auth');
      expect(response.body.endpoints).to.have.property('items');
      
      // Validate auth endpoints
      expect(response.body.endpoints.auth).to.have.property('register', 'POST /register');
      expect(response.body.endpoints.auth).to.have.property('login', 'POST /login');
      
      // Validate items endpoints
      expect(response.body.endpoints.items).to.have.property('getAll', 'GET /items');
      expect(response.body.endpoints.items).to.have.property('create', 'POST /items');
      expect(response.body.endpoints.items).to.have.property('update', 'PUT /items/:id');
      expect(response.body.endpoints.items).to.have.property('delete', 'DELETE /items/:id');
    });
  });

  it('Invalid endpoint - Should return 404', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/invalid-endpoint`,
      failOnStatusCode: false,
      timeout: 10000
    }).then((response) => {
      // Validate 404 response
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Route not found');
    });
  });
});
