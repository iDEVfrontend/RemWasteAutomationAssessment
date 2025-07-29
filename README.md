# RemWaste QA Automation Assessment

A comprehensive test automation framework for the RemWaste application featuring both UI and API test suites. This project demonstrates proficiency in modern QA practices including Page Object Model, API testing, and automated reporting.

## 🎯 Overview

This assessment includes:
- **UI Automation**: Complete login and dashboard CRUD operations testing
- **API Automation**: RESTful API endpoint testing with comprehensive coverage
- **Page Object Model**: Maintainable and scalable test architecture
- **Automated Reporting**: HTML reports with screenshots and videos
- **Cross-browser Testing**: Chrome, Firefox, and Edge support
## 🏗️ Project Structure

```
├── cypress/
│   ├── e2e/
│   │   ├── CrudAutomation/          # UI Test Suites
│   │   │   ├── login-pom.cy.js      # Login functionality tests
│   │   │   ├── dashboard-pom.cy.js  # Dashboard CRUD tests
│   │   │   └── dashboard.cy.js      # Traditional approach tests
│   │   └── ApiAutomation/           # API Test Suites
│   │       ├── health-pom-api.cy.js # Health check endpoints
│   │       ├── auth-pom-api.cy.js   # Authentication endpoints
│   │       └── items-pom-api.cy.js  # Items CRUD endpoints
│   ├── pages/                       # Page Object Models
│   │   ├── LoginPage.js            # Login page interactions
│   │   └── DashboardPage.js        # Dashboard page interactions
│   ├── api/                        # API Service Layer
│   │   ├── services/               # API service classes
│   │   │   ├── BaseApiService.js   # Base API functionality
│   │   │   ├── HealthApiService.js # Health check services
│   │   │   ├── AuthApiService.js   # Authentication services
│   │   │   └── ItemsApiService.js  # Items CRUD services
│   │   └── models/
│   │       └── TestDataModels.js   # Test data and fixtures
│   ├── fixtures/                   # Test data files
│   ├── support/                    # Cypress configurations
│   ├── reports/                    # Generated HTML reports
│   ├── screenshots/                # Failure screenshots
│   └── videos/                     # Test execution videos
├── runUITests.js                   # UI test runner with reporting
├── runAPITests.js                  # API test runner with reporting
├── reportGenerator.js              # Custom report generation
├── viewReport.js                   # Report viewer utility
├── cypress.config.js               # Cypress configuration
└── package.json                    # Dependencies and scripts
```
## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Chrome browser (recommended)

### Installation
```bash
npm install
```

### Running Tests

#### 🖥️ UI Tests
```bash
# Run all UI tests with reporting (recommended)
npm run ui:pom

# Run with browser visible
npm run ui:pom:headed

# Run individual UI test suites
npm run ui:login
npm run ui:dashboard

# Open Cypress UI for interactive testing
npm run ui:open
```

#### 🌐 API Tests
```bash
# Run all API tests with reporting (recommended)
npm run api:all

# Run with browser visible
npm run api:headed

# Run individual API test suites
npm run api:health
npm run api:auth
npm run api:items

# Open Cypress UI for API testing
npm run api:open
```

#### 🔄 Run Everything
```bash
# Run both UI and API tests sequentially
npm run test:all
```
## 📋 Test Coverage

### UI Test Suite (32 test cases)

#### Login Functionality
- ✅ Homepage verification and loading
- ✅ Form validation (empty fields, invalid email formats)
- ✅ Authentication flows (valid/invalid credentials)
- ✅ Security testing (SQL injection, XSS prevention)
- ✅ Responsive design (mobile, tablet, desktop viewports)
- ✅ Error handling and network failure scenarios
- ✅ Session management and navigation

#### Dashboard CRUD Operations
- ✅ Dashboard accessibility after login
- ✅ Create waste item functionality
- ✅ Update existing items
- ✅ Delete item operations
- ✅ Session continuity across operations
- ✅ Modal interactions and state management

### API Test Suite

#### Health & System Endpoints
- ✅ API health status verification
- ✅ System endpoint accessibility
- ✅ Response time and performance checks

#### Authentication API
- ✅ User registration workflow
- ✅ Login/logout functionality
- ✅ Token validation and refresh
- ✅ Error handling for invalid credentials

#### Items CRUD API
- ✅ Create new waste items
- ✅ Retrieve item lists and details
- ✅ Update item information
- ✅ Delete items with proper authorization
- ✅ Data validation and error scenarios
## 🎭 Testing Approaches

### Page Object Model (POM)
The framework implements industry-standard POM patterns for maintainable and scalable tests:

- **Separation of Concerns**: UI interactions separated from test logic
- **Reusability**: Page objects can be used across multiple test suites
- **Maintainability**: UI changes only require updates in page objects
- **Readability**: Tests focus on business logic rather than implementation details

### API Service Layer
API tests utilize a service layer architecture:

- **BaseApiService**: Common HTTP methods and error handling
- **Specialized Services**: Dedicated classes for different API domains
- **Test Data Models**: Centralized test data management
- **Response Validation**: Comprehensive API response verification

## 🔧 Configuration

### Test Environment
- **Application URL**: `https://remwasteapp-frontend.onrender.com/`
- **Test User Email**: `remwaste.x6j6cw@bumpmail.io`
- **Test Password**: `Test1234!`

### Browser Support
```bash
npm run test:chrome    # Chrome browser
npm run test:firefox   # Firefox browser  
npm run test:edge      # Microsoft Edge
```

### Responsive Testing
```bash
npm run test:mobile    # 375x667 viewport (mobile)
npm run test:tablet    # 768x1024 viewport (tablet)
npm run test:desktop   # 1280x720 viewport (desktop)
```
## 📊 Reporting & Analysis

### Automated HTML Reports
Both UI and API test runners generate comprehensive HTML reports including:
- Pass/fail statistics with visual indicators
- Execution time and performance metrics
- Detailed test results with error messages
- Screenshots for failed tests
- Test execution videos

### Report Viewing
```bash
# Auto-opens latest report in Chrome
npm run view-report

# View reports manually
# Navigate to: cypress/reports/
```

### Debug Artifacts
- **Screenshots**: Automatically captured on test failures
- **Videos**: Full test execution recordings for all suites
- **Console Logs**: Detailed logging for troubleshooting

## 🛠️ Custom Commands & Utilities

### Authentication Commands
```javascript
cy.login(email, password)           // Login with credentials
cy.clearAppData()                   // Clear session data
cy.verifyAuthenticated()            // Verify login state
```

### UI Testing Commands  
```javascript
cy.createTestItem(itemData)         // Create waste item with navigation
cy.assertModalClosed()              // Safe modal state verification
cy.checkPageReady(context)          // Page readiness validation
```

### Security Testing Commands
```javascript
cy.testSecurityInput(type, values)  // Test injection attacks
cy.testResponsive(viewports)         // Multi-viewport testing
```
## 🔍 Development & Maintenance

### Adding New Tests

#### UI Tests
1. Create test file in `cypress/e2e/CrudAutomation/`
2. Import required page objects from `cypress/pages/`
3. Follow existing POM patterns for consistency

#### API Tests
1. Create test file in `cypress/e2e/ApiAutomation/`
2. Import required services from `cypress/api/services/`
3. Use existing service patterns for new endpoints

### Extending Page Objects
```javascript
// cypress/pages/NewPage.js
class NewPage {
  visit() {
    cy.visit('/new-page');
  }
  
  performAction() {
    // Page-specific actions
  }
}

export default NewPage;
```

### Creating API Services
```javascript
// cypress/api/services/NewApiService.js
import BaseApiService from './BaseApiService.js';

class NewApiService extends BaseApiService {
  getNewData(token) {
    return this.get('/new-endpoint', {
      headers: this.createAuthHeader(token)
    });
  }
}

export default NewApiService;
```
## 🧪 Test Data Management

Test data is centralized in `cypress/fixtures/testData.json` and `cypress/api/models/TestDataModels.js`:

- User credentials for different test scenarios
- Form validation test cases
- API request/response data models
- Security testing payloads
- Responsive design viewport configurations

## 🔒 Security Testing

The framework includes comprehensive security testing:

- **Input Validation**: SQL injection and XSS attack prevention
- **Authentication**: Secure login/logout flows
- **Session Management**: Proper session handling and timeouts
- **Data Protection**: Sensitive data handling in API requests

## ⚡ Performance Considerations

- **Parallel Execution**: Tests designed for parallel execution
- **Smart Waits**: Intelligent waiting strategies to reduce flaky tests
- **Resource Cleanup**: Automatic cleanup of test data and sessions
- **Optimized Selectors**: Efficient element selection strategies

## 🐛 Troubleshooting

### Common Issues

**Tests failing with timeout errors:**
- Verify application is accessible at the configured URL
- Check network connectivity
- Increase timeout values in cypress.config.js if needed

**Browser not launching:**
```bash
# Try alternative browsers
npm run test:firefox
npm run test:edge
```

**Import path errors after file moves:**
- Verify page object imports use correct relative paths
- Check API service imports in test files

### Debug Mode
```bash
# Run tests with browser visible for debugging
npm run ui:pom:headed
npm run api:headed
```

### Clean Environment
```bash
# Clear all generated artifacts
npm run clean
```

---

## 📈 Assessment Highlights

This automation framework demonstrates:

✅ **Industry Best Practices**: POM pattern, service layer architecture  
✅ **Comprehensive Coverage**: Both UI and API testing  
✅ **Professional Reporting**: Automated HTML reports with artifacts  
✅ **Maintainable Code**: Clean, readable, and well-documented  
✅ **Security Focus**: Input validation and attack prevention testing  
✅ **Cross-browser Support**: Multi-browser compatibility  
✅ **Responsive Testing**: Mobile, tablet, and desktop viewports  
✅ **CI/CD Ready**: Structured for continuous integration  

**Ready for production use! 🚀**