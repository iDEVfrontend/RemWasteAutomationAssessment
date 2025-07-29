// Items CRUD API Tests - POM Structure
// Tests complete waste items management functionality

import AuthApiService from '../../api/services/AuthApiService.js';
import ItemsApiService from '../../api/services/ItemsApiService.js';
import TestDataModels from '../../api/models/TestDataModels.js';

describe('RemWaste API - Items CRUD Tests (POM)', () => {
  let authApi;
  let itemsApi;
  let testUser;
  let userToken;
  let errorMessages;

  before(() => {
    authApi = new AuthApiService();
    itemsApi = new ItemsApiService();
    errorMessages = TestDataModels.getItemsErrorMessages();

    // Create and login test user for all tests
    authApi.createAndLoginUser().then(result => {
      testUser = result;
      userToken = result.token;
      cy.log(`Test user created: ${result.email} (ID: ${result.userId})`);
    });
  });

  describe('Authentication Requirements', () => {
    it('Should fail to get items without authentication', () => {
      itemsApi.getUserItemsWithoutAuth().then(() => {
        cy.log('✅ Authentication requirement enforced');
      });
    });

    it('Should fail to get items with invalid token', () => {
      itemsApi.getUserItemsWithInvalidToken().then(() => {
        cy.log('✅ Invalid token handling verified');
      });
    });
  });

  describe('Items READ Operations', () => {
    it('Should return empty array for new user', () => {
      itemsApi.getUserItems(userToken).then(items => {
        expect(items).to.be.an('array');
        expect(items).to.have.length(0);
        cy.log('✅ New user has no items initially');
      });
    });
  });

  describe('Items CREATE Operations', () => {
    it('Should create item with complete data', () => {
      const itemData = TestDataModels.getCompleteItem();
      
      itemsApi.createItem(userToken, itemData).then(createdItem => {
        expect(createdItem.title).to.eq(itemData.title);
        expect(createdItem.description).to.eq(itemData.description);
        expect(createdItem.location).to.eq(itemData.location);
        expect(createdItem.status).to.eq(itemData.status);
        
        cy.log(`✅ Item created: ${createdItem.title} (ID: ${createdItem.id})`);
        
        // Clean up
        itemsApi.deleteItem(userToken, createdItem.id);
      });
    });

    it('Should create item with minimal data', () => {
      const itemData = TestDataModels.getMinimalItem();
      
      itemsApi.createItem(userToken, itemData).then(createdItem => {
        expect(createdItem.title).to.eq(itemData.title);
        expect(createdItem.status).to.eq('pending'); // Default status
        
        cy.log(`✅ Minimal item created: ${createdItem.title}`);
        
        // Clean up
        itemsApi.deleteItem(userToken, createdItem.id);
      });
    });

    it('Should fail to create item without title', () => {
      itemsApi.createItemWithoutTitle(userToken).then(() => {
        cy.log('✅ Title requirement validation passed');
      });
    });
  });

  describe('Items UPDATE Operations', () => {
    let testItem;

    beforeEach(() => {
      // Create an item to update
      const itemData = TestDataModels.getValidItem();
      itemsApi.createItem(userToken, itemData).then(createdItem => {
        testItem = createdItem;
      });
    });

    afterEach(() => {
      // Clean up test item
      if (testItem && testItem.id) {
        itemsApi.deleteItem(userToken, testItem.id);
      }
    });

    it('Should update item successfully', () => {
      const updateData = TestDataModels.getItemUpdateData();
      
      itemsApi.updateItem(userToken, testItem.id, updateData).then(updatedItem => {
        expect(updatedItem.id).to.eq(testItem.id);
        expect(updatedItem.title).to.eq(updateData.title);
        expect(updatedItem.status).to.eq(updateData.status);
        
        cy.log(`✅ Item updated: ${updatedItem.title}`);
      });
    });

    it('Should fail to update non-existent item', () => {
      itemsApi.updateNonExistentItem(userToken).then(() => {
        cy.log('✅ Non-existent item validation passed');
      });
    });
  });

  describe('Items DELETE Operations', () => {
    let testItem;

    beforeEach(() => {
      // Create an item to delete
      const itemData = TestDataModels.getValidItem();
      itemsApi.createItem(userToken, itemData).then(createdItem => {
        testItem = createdItem;
      });
    });

    it('Should delete item successfully', () => {
      itemsApi.deleteItem(userToken, testItem.id).then(response => {
        cy.log(`✅ Item deleted: ${testItem.id}`);
        
        // Verify item is deleted by trying to delete again
        itemsApi.deleteNonExistentItem(userToken, testItem.id).then(() => {
          cy.log('✅ Item deletion confirmed');
        });
      });
    });

    it('Should fail to delete non-existent item', () => {
      itemsApi.deleteNonExistentItem(userToken).then(() => {
        cy.log('✅ Non-existent item deletion validation passed');
      });
    });
  });

  describe('Items WORKFLOW Operations', () => {
    it('Should complete full CRUD workflow', () => {
      itemsApi.performCompleteItemWorkflow(userToken).then(result => {
        expect(result.created).to.have.property('id');
        expect(result.deleted).to.have.property('body');
        
        cy.log(`✅ Complete CRUD workflow: Created ID ${result.created.id}`);
      });
    });

    it('Should validate status values', () => {
      itemsApi.testValidStatusValues(userToken).then(items => {
        expect(items).to.have.length(3);
        
        const statuses = items.map(item => item.status);
        expect(statuses).to.include.members(['pending', 'collected', 'processed']);
        
        cy.log(`✅ Status validation passed for: ${statuses.join(', ')}`);
      });
    });
  });

  describe('Items DATA Operations', () => {
    it('Should handle multiple items for user', () => {
      const multipleItems = TestDataModels.generateMultipleItems(3);
      const createdItems = [];
      
      // Create multiple items using Cypress command chaining
      cy.wrap(multipleItems).each((itemData) => {
        itemsApi.createItem(userToken, itemData).then(item => {
          createdItems.push(item);
          cy.log(`✅ Created item: ${item.title} (ID: ${item.id})`);
        });
      }).then(() => {
        expect(createdItems).to.have.length(3);
        cy.log(`✅ Created ${createdItems.length} items for user`);
        
        // Verify we can retrieve all items
        itemsApi.getUserItems(userToken).then(userItems => {
          expect(userItems.length).to.be.greaterThan(0);
          cy.log(`✅ Retrieved ${userItems.length} items for user`);
          
          // Clean up all created items using Cypress command chaining
          cy.wrap(createdItems).each((item) => {
            itemsApi.deleteItem(userToken, item.id);
          }).then(() => {
            cy.log('✅ All test items cleaned up');
          });
        });
      });
    });
  });
});
