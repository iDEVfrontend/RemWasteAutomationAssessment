// Test Data Models and Fixtures
// Provides consistent test data for API automation

class TestDataModels {
  
  // User data models
  static getValidUser() {
    const timestamp = Date.now();
    return {
      email: `valid.user.${timestamp}@remwaste.test`,
      password: 'ValidPassword123!'
    };
  }

  static getInvalidUserData() {
    return {
      missingEmail: {
        password: 'password123'
      },
      missingPassword: {
        email: 'test@example.com'
      },
      emptyData: {},
      invalidEmail: {
        email: 'invalid-email',
        password: 'password123'
      },
      weakPassword: {
        email: 'test@example.com',
        password: '123'
      }
    };
  }

  // Item data models
  static getValidItem() {
    return {
      title: 'Test Plastic Bottle',
      description: 'Empty water bottle for recycling',
      location: 'Kitchen Counter',
      weight: 0.5,
      status: 'pending'
    };
  }

  static getMinimalItem() {
    return {
      title: 'Minimal Test Item'
    };
  }

  static getCompleteItem() {
    return {
      title: 'Complete Test Item',
      description: 'This is a complete item with all fields',
      location: 'Test Location - Basement',
      weight: 2.5,
      status: 'collected'
    };
  }

  static getInvalidItemData() {
    return {
      missingTitle: {
        description: 'Item without title'
      },
      invalidWeight: {
        title: 'Invalid Weight Item',
        weight: 'not-a-number'
      },
      invalidStatus: {
        title: 'Invalid Status Item',
        status: 'invalid-status'
      }
    };
  }

  static getItemUpdateData() {
    return {
      title: 'Updated Item Title',
      description: 'Updated description',
      location: 'Updated Location - Recycling Center',
      weight: 1.8,
      status: 'processed'
    };
  }

  // Status values
  static getValidStatuses() {
    return ['pending', 'collected', 'processed'];
  }

  static getInvalidStatuses() {
    return ['invalid', 'unknown', 'completed', ''];
  }

  // Common test scenarios
  static getCrudWorkflowData() {
    return {
      create: {
        title: 'CRUD Workflow Item',
        description: 'Item for testing complete CRUD workflow',
        location: 'Test Environment',
        weight: 1.0,
        status: 'pending'
      },
      update: {
        title: 'Updated CRUD Item',
        description: 'Updated during CRUD workflow test',
        location: 'Updated Test Environment',
        weight: 1.5,
        status: 'collected'
      }
    };
  }

  // Generate bulk test data
  static generateMultipleItems(count = 3) {
    const items = [];
    for (let i = 1; i <= count; i++) {
      items.push({
        title: `Bulk Test Item ${i}`,
        description: `Description for bulk test item ${i}`,
        location: `Location ${i}`,
        weight: parseFloat((Math.random() * 5).toFixed(2)),
        status: this.getValidStatuses()[i % 3]
      });
    }
    return items;
  }

  // Authentication error messages
  static getAuthErrorMessages() {
    return {
      MISSING_CREDENTIALS: 'Email and password are required',
      INVALID_CREDENTIALS: 'Invalid credentials',
      USER_EXISTS: 'User already exists',
      TOKEN_REQUIRED: 'Access token required',
      INVALID_TOKEN: 'Invalid or expired token'
    };
  }

  // Items error messages
  static getItemsErrorMessages() {
    return {
      TITLE_REQUIRED: 'Title is required',
      ITEM_NOT_FOUND: 'Item not found',
      ROUTE_NOT_FOUND: 'Route not found'
    };
  }
}

export default TestDataModels;
