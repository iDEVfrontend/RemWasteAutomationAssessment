describe('RemWaste API - Items CRUD Tests', () => {
  const baseUrl = 'https://remwaste-backend.onrender.com';
  let testEmail;
  let testPassword;
  let authToken;
  let userId;
  let createdItemId;

  before(() => {
    // Generate unique test user for this test suite
    const timestamp = Date.now();
    testEmail = `items.test.${timestamp}@remwaste.test`;
    testPassword = 'TestPassword123!';

    // Register and login user for all tests
    cy.request({
      method: 'POST',
      url: `${baseUrl}/register`,
      body: {
        email: testEmail,
        password: testPassword
      }
    }).then((regResponse) => {
      userId = regResponse.body.userId;
      
      // Login to get auth token
      cy.request({
        method: 'POST',
        url: `${baseUrl}/login`,
        body: {
          email: testEmail,
          password: testPassword
        }
      }).then((loginResponse) => {
        authToken = loginResponse.body.token;
        cy.log(`Setup complete - User ID: ${userId}, Token: ${authToken.substring(0, 20)}...`);
      });
    });
  });

  describe('Items - Authentication Required', () => {
    it('GET /items - Should fail without authentication token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/items`,
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Access token required');
      });
    });

    it('GET /items - Should fail with invalid token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property('error', 'Invalid or expired token');
      });
    });
  });
});
  describe('Items - GET Operations', () => {
    it('GET /items - Should return empty array for new user', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Items retrieved successfully');
        expect(response.body).to.have.property('items');
        expect(response.body.items).to.be.an('array');
        expect(response.body.items).to.have.length(0);
      });
    });
  });

  describe('Items - CREATE Operations', () => {
    it('POST /items - Should create new item successfully', () => {
      const itemData = {
        title: 'Test Plastic Bottle',
        description: 'Empty water bottle for recycling',
        location: 'Kitchen Counter',
        weight: 0.5,
        status: 'pending'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: itemData,
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('message', 'Item created successfully');
        expect(response.body).to.have.property('item');
        
        const item = response.body.item;
        expect(item).to.have.property('id');
        expect(item).to.have.property('title', itemData.title);
        expect(item).to.have.property('description', itemData.description);
        expect(item).to.have.property('location', itemData.location);
        expect(item).to.have.property('weight');
        expect(item).to.have.property('status', itemData.status);
        expect(item).to.have.property('user_id', userId);
        expect(item).to.have.property('created_at');
        
        createdItemId = item.id;
        cy.log(`Item created with ID: ${createdItemId}`);
      });
    });

    it('POST /items - Should create item with only required fields', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Minimal Item'
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.item).to.have.property('title', 'Minimal Item');
        expect(response.body.item).to.have.property('status', 'pending'); // Default status
      });
    });

    it('POST /items - Should fail without title', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          description: 'Item without title'
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'Title is required');
      });
    });
  });
});
  describe('Items - READ Operations After Creation', () => {
    it('GET /items - Should return created items', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('items');
        expect(response.body.items).to.be.an('array');
        expect(response.body.items.length).to.be.greaterThan(0);
        
        // Verify items are ordered by created_at DESC (newest first)
        if (response.body.items.length > 1) {
          const firstItem = new Date(response.body.items[0].created_at);
          const secondItem = new Date(response.body.items[1].created_at);
          expect(firstItem.getTime()).to.be.greaterThan(secondItem.getTime());
        }
      });
    });
  });

  describe('Items - UPDATE Operations', () => {
    it('PUT /items/:id - Should update item successfully', () => {
      const updatedData = {
        title: 'Updated Plastic Bottle',
        description: 'Updated description for the bottle',
        location: 'Updated Location - Recycling Bin',
        weight: 0.6,
        status: 'collected'
      };

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/items/${createdItemId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: updatedData,
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Item updated successfully');
        expect(response.body).to.have.property('item');
        
        const item = response.body.item;
        expect(item).to.have.property('id', createdItemId);
        expect(item).to.have.property('title', updatedData.title);
        expect(item).to.have.property('description', updatedData.description);
        expect(item).to.have.property('location', updatedData.location);
        expect(item).to.have.property('status', updatedData.status);
        expect(item).to.have.property('updated_at');
      });
    });

    it('PUT /items/:id - Should fail to update non-existent item', () => {
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/items/99999`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Non-existent Item'
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Item not found');
      });
    });

    it('PUT /items/:id - Should fail without title', () => {
      cy.request({
        method: 'PUT',
        url: `${baseUrl}/items/${createdItemId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          description: 'Update without title'
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'Title is required');
      });
    });
  });
});
  describe('Items - DELETE Operations', () => {
    it('DELETE /items/:id - Should delete item successfully', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/items/${createdItemId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Item deleted successfully');
        expect(response.body).to.have.property('deletedItemId', createdItemId.toString());
      });
    });

    it('DELETE /items/:id - Should fail to delete already deleted item', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/items/${createdItemId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Item not found');
      });
    });

    it('DELETE /items/:id - Should fail to delete non-existent item', () => {
      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/items/99999`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false,
        timeout: 10000
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Item not found');
      });
    });
  });

  describe('Items - Status Validation', () => {
    it('POST /items - Should accept valid status values', () => {
      const validStatuses = ['pending', 'collected', 'processed'];
      
      validStatuses.forEach((status, index) => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/items`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: {
            title: `Status Test Item ${index + 1}`,
            status: status
          },
          timeout: 15000
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.item).to.have.property('status', status);
          
          // Clean up - delete the test item
          cy.request({
            method: 'DELETE',
            url: `${baseUrl}/items/${response.body.item.id}`,
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
        });
      });
    });
  });

  describe('Items - Data Types Validation', () => {
    it('POST /items - Should handle weight as number', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/items`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          title: 'Weight Test Item',
          weight: 2.5
        },
        timeout: 15000
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.item.weight).to.be.a('number');
        expect(response.body.item.weight).to.eq(2.5);
        
        // Clean up
        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/items/${response.body.item.id}`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      });
    });
  });
});