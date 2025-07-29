// Items API Service
// Handles waste items CRUD operations

import BaseApiService from './BaseApiService.js';

class ItemsApiService extends BaseApiService {
  
  // GET /items - Get all items for authenticated user
  getUserItems(token) {
    const headers = this.createAuthHeader(token);
    
    return this.get('/items', { headers }).then(response => {
      this.validateResponse(response, 200);
      
      // Validate items response structure
      expect(response.body).to.have.property('message', 'Items retrieved successfully');
      expect(response.body).to.have.property('items');
      expect(response.body.items).to.be.an('array');
      
      return response.body.items;
    });
  }

  // GET /items without authentication - should fail
  getUserItemsWithoutAuth() {
    return this.get('/items', { 
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error', 'Access token required');
      return response;
    });
  }

  // GET /items with invalid token - should fail
  getUserItemsWithInvalidToken() {
    const headers = this.createAuthHeader('invalid-token');
    
    return this.get('/items', { 
      headers,
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(403);
      expect(response.body).to.have.property('error', 'Invalid or expired token');
      return response;
    });
  }

  // POST /items - Create new item
  createItem(token, itemData = {}) {
    const headers = this.createAuthHeader(token);
    const defaultItem = {
      title: 'Test Item',
      description: 'Test description',
      location: 'Test location',
      weight: 1.0,
      status: 'pending'
    };
    
    const item = { ...defaultItem, ...itemData };
    
    return this.post('/items', item, { headers }).then(response => {
      this.validateResponse(response, 201);
      
      // Validate create response
      expect(response.body).to.have.property('message', 'Item created successfully');
      expect(response.body).to.have.property('item');
      
      const createdItem = response.body.item;
      expect(createdItem).to.have.property('id');
      expect(createdItem).to.have.property('title', item.title);
      expect(createdItem).to.have.property('created_at');
      
      return createdItem;
    });
  }

  // POST /items without title - should fail
  createItemWithoutTitle(token) {
    const headers = this.createAuthHeader(token);
    const invalidItem = {
      description: 'Item without title'
    };
    
    return this.post('/items', invalidItem, { 
      headers,
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Title is required');
      return response;
    });
  }

  // PUT /items/:id - Update existing item
  updateItem(token, itemId, updateData = {}) {
    const headers = this.createAuthHeader(token);
    const defaultUpdate = {
      title: 'Updated Item',
      description: 'Updated description',
      location: 'Updated location',
      weight: 2.0,
      status: 'collected'
    };
    
    const item = { ...defaultUpdate, ...updateData };
    
    return this.put(`/items/${itemId}`, item, { headers }).then(response => {
      this.validateResponse(response, 200);
      
      // Validate update response
      expect(response.body).to.have.property('message', 'Item updated successfully');
      expect(response.body).to.have.property('item');
      
      const updatedItem = response.body.item;
      expect(updatedItem).to.have.property('id', itemId);
      expect(updatedItem).to.have.property('title', item.title);
      expect(updatedItem).to.have.property('updated_at');
      
      return updatedItem;
    });
  }

  // PUT /items/:id with invalid ID - should fail
  updateNonExistentItem(token, itemId = 99999) {
    const headers = this.createAuthHeader(token);
    const item = { title: 'Non-existent Item' };
    
    return this.put(`/items/${itemId}`, item, { 
      headers,
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Item not found');
      return response;
    });
  }

  // DELETE /items/:id - Delete item
  deleteItem(token, itemId) {
    const headers = this.createAuthHeader(token);
    
    return this.delete(`/items/${itemId}`, { headers }).then(response => {
      this.validateResponse(response, 200);
      
      // Validate delete response
      expect(response.body).to.have.property('message', 'Item deleted successfully');
      expect(response.body).to.have.property('deletedItemId', itemId.toString());
      
      return response;
    });
  }

  // DELETE /items/:id with invalid ID - should fail
  deleteNonExistentItem(token, itemId = 99999) {
    const headers = this.createAuthHeader(token);
    
    return this.delete(`/items/${itemId}`, { 
      headers,
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('error', 'Item not found');
      return response;
    });
  }

  // Complete CRUD workflow
  performCompleteItemWorkflow(token) {
    let createdItem;
    
    // Create item
    return this.createItem(token, { title: 'Workflow Test Item' })
      .then(item => {
        createdItem = item;
        
        // Update item
        return this.updateItem(token, item.id, { 
          title: 'Updated Workflow Item',
          status: 'collected'
        });
      })
      .then(updatedItem => {
        
        // Delete item
        return this.deleteItem(token, updatedItem.id);
      })
      .then(deleteResponse => {
        return {
          created: createdItem,
          deleted: deleteResponse
        };
      });
  }

  // Validate status values
  testValidStatusValues(token) {
    const validStatuses = ['pending', 'collected', 'processed'];
    const createdItems = [];
    
    // Create items with each status using Cypress command chaining
    return cy.wrap(validStatuses).then(() => {
      // Create items sequentially
      let createChain = cy.wrap(null);
      
      validStatuses.forEach((status, index) => {
        createChain = createChain.then(() => {
          return this.createItem(token, {
            title: `Status Test Item ${index + 1}`,
            status: status
          }).then(item => {
            expect(item.status).to.eq(status);
            createdItems.push(item);
            return item;
          });
        });
      });
      
      return createChain;
    }).then(() => {
      // Clean up created items using Cypress command chaining
      let deleteChain = cy.wrap(null);
      
      createdItems.forEach(item => {
        deleteChain = deleteChain.then(() => {
          return this.deleteItem(token, item.id);
        });
      });
      
      return deleteChain.then(() => createdItems);
    });
  }
}

export default ItemsApiService;
