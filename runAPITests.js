#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const { generateTestReport, saveReport } = require('./reportGenerator.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  return new Promise((resolve, reject) => {
    log(`\n🚀 ${description}...`, 'cyan');
    log(`Command: ${command}`, 'yellow');
    
    const startTime = Date.now();
    const process = exec(command, { 
      timeout: 300000,
      cwd: path.resolve(__dirname)
    });
    
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    process.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        log(`✅ ${description} completed successfully (${duration}s)`, 'green');
        resolve({ success: true, code, duration });
      } else {
        log(`❌ ${description} failed with exit code ${code} (${duration}s)`, 'red');
        resolve({ success: false, code, duration });
      }
    });
    
    process.on('error', (error) => {
      log(`❌ Error running ${description}: ${error.message}`, 'red');
      resolve({ success: false, code: 1, duration: 0 });
    });
  });
};

// Auto-open report in Chrome
const openReportInChrome = (reportPath) => {
  const fs = require('fs');
  
  // Find Chrome executable
  const commonChromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  
  let chromePath = null;
  for (const path of commonChromePaths) {
    if (fs.existsSync(path)) {
      chromePath = path;
      break;
    }
  }
  
  if (chromePath) {
    log('🌐 Opening report in Chrome browser...', 'cyan');
    exec(`"${chromePath}" "${reportPath}"`, (error) => {
      if (error) {
        log('❌ Could not open with Chrome, check the report manually', 'yellow');
        log(`📄 Report location: ${reportPath}`, 'blue');
      } else {
        log('✅ Report opened successfully in Chrome!', 'green');
      }
    });
  } else {
    log('❌ Chrome not found, check the report manually', 'yellow');
    log(`📄 Report location: ${reportPath}`, 'blue');
  }
};

// API Test Suites in correct execution order
const apiTestSuites = [
  {
    name: 'API Health Tests',
    spec: 'cypress/e2e/ApiAutomation/health-pom-api.cy.js',
    description: 'Testing API health and system status endpoints',
    critical: true
  },
  {
    name: 'API Authentication Tests',
    spec: 'cypress/e2e/ApiAutomation/auth-pom-api.cy.js',
    description: 'Testing user registration, login, and JWT token management',
    critical: true
  },
  {
    name: 'API Items CRUD Tests', 
    spec: 'cypress/e2e/ApiAutomation/items-pom-api.cy.js',
    description: 'Testing complete waste items CRUD operations',
    critical: true
  }
];

// Main API test runner function
async function runApiTests() {
  log('🎯 RemWaste API Test Suite - Automated Execution', 'bright');
  log('===================================================', 'bright');
  log('📋 API tests will run automatically in sequence:', 'blue');
  log('   1. Health Tests (system status & endpoints)', 'blue');
  log('   2. Authentication Tests (login, registration, tokens)', 'blue');
  log('   3. Items CRUD Tests (create, read, update, delete)', 'blue');
  log('', 'reset');
  
  const results = {
    total: apiTestSuites.length,
    passed: 0,
    failed: 0,
    startTime: Date.now(),
    details: []
  };

  // Check if we're in headed or headless mode
  const isHeaded = process.argv.includes('--headed') || process.argv.includes('--visible');
  const headedFlag = isHeaded ? '--headed' : '';
  
  if (isHeaded) {
    log('👁️  Running tests with browser visible', 'magenta');
  } else {
    log('🖥️  Running tests in headless mode', 'magenta');
  }
  
  // Run each test suite in sequence
  for (let i = 0; i < apiTestSuites.length; i++) {
    const suite = apiTestSuites[i];
    
    log(`\n📋 Test ${i + 1} of ${apiTestSuites.length}`, 'bright');
    log(`🎯 ${suite.description}`, 'cyan');
    
    const command = `npx cypress run --spec "${suite.spec}" ${headedFlag} --browser chrome`;
    const result = await runCommand(command, suite.name);
    
    results.details.push({
      name: suite.name,
      success: result.success,
      duration: result.duration
    });
    
    if (result.success) {
      results.passed++;
      log(`🎉 ${suite.name} - ALL TESTS PASSED!`, 'green');
    } else {
      results.failed++;
      log(`💥 ${suite.name} - SOME TESTS FAILED`, 'red');
      
      if (suite.critical) {
        log(`⚠️  Critical test suite failed: ${suite.name}`, 'yellow');
        // Don't stop execution - continue to next test suite for complete report
      }
    }
    
    // Brief pause between test suites
    if (i < apiTestSuites.length - 1) {
      log('⏳ Preparing next test suite...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Generate comprehensive summary
  const totalTime = ((Date.now() - results.startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(60), 'bright');
  log('📊 FINAL API TEST EXECUTION SUMMARY', 'bright');
  log('='.repeat(60), 'bright');
  
  log(`📋 Total Test Suites: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`⏱️  Total Execution Time: ${totalTime}s`, 'blue');
  
  // Detailed breakdown
  log('\n📋 Detailed Results:', 'bright');
  results.details.forEach((detail, index) => {
    const status = detail.success ? '✅ PASSED' : '❌ FAILED';
    const color = detail.success ? 'green' : 'red';
    log(`   ${index + 1}. ${detail.name}: ${status} (${detail.duration}s)`, color);
  });
  
  // Success/failure analysis
  if (results.failed === 0) {
    log('\n🎉 SUCCESS: ALL API TESTS COMPLETED SUCCESSFULLY!', 'green');
    log('🏆 Your API endpoints are working perfectly!', 'green');
  } else if (results.passed > 0) {
    log(`\n⚠️  PARTIAL SUCCESS: ${results.passed}/${results.total} test suites passed`, 'yellow');
    log('🔍 Check the detailed results above for specific failures', 'yellow');
  } else {
    log('\n💥 ALL API TESTS FAILED', 'red');
    log('🔍 Check cypress/screenshots/ and cypress/videos/ for debug info', 'yellow');
  }
  
  // Generate and auto-open HTML report
  try {
    // Create API-specific report
    const html = generateApiTestReport(results);
    const reportPath = saveReport(html, `api-test-report-${Date.now()}.html`);
    log('\n📊 Generated API Test Report:', 'bright');
    log(`   📄 ${reportPath}`, 'blue');
    
    // Auto-open report in Chrome if tests were successful
    if (results.failed === 0) {
      log('\n🎊 All tests passed! Opening report in Chrome...', 'green');
      openReportInChrome(reportPath);
    } else {
      log('\n📋 Some tests failed. Opening report for analysis...', 'yellow');
      openReportInChrome(reportPath);
    }
    
  } catch (error) {
    log('\n⚠️ Could not generate HTML report:', 'yellow');
    log(`   Error: ${error.message}`, 'yellow');
  }
  
  log('\n📁 Other Generated Files:', 'bright');
  log('   📹 Videos: cypress/videos/', 'blue');
  if (results.failed > 0) {
    log('   📷 Screenshots: cypress/screenshots/', 'blue');
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Generate API-specific HTML report
function generateApiTestReport(results) {
  const { total, passed, failed, startTime, details } = results;
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  const timestamp = new Date().toLocaleString();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RemWaste API Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .time { color: #6f42c1; }
        
        .results {
            padding: 30px;
        }
        
        .results h2 {
            margin-bottom: 20px;
            color: #2c3e50;
            font-size: 1.8em;
        }
        
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid;
            transition: all 0.3s ease;
        }
        
        .test-item:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .test-item.success {
            background: #d4edda;
            border-color: #28a745;
        }
        
        .test-item.failure {
            background: #f8d7da;
            border-color: #dc3545;
        }
        
        .test-name {
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .test-status {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-badge.pass {
            background: #28a745;
            color: white;
        }
        
        .status-badge.fail {
            background: #dc3545;
            color: white;
        }
        
        .duration {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
        }
        
        .progress-bar {
            background: #e9ecef;
            border-radius: 10px;
            height: 20px;
            margin: 20px 0;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            border-radius: 10px;
            transition: width 0.5s ease;
        }
        
        .icon {
            font-size: 1.5em;
            margin-right: 10px;
        }
        
        .api-badge {
            background: linear-gradient(135deg, #e74c3c, #f39c12);
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            margin-left: 10px;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stats {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                padding: 20px;
            }
            
            .test-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔗 RemWaste API Test Report</h1>
            <p>Backend API Endpoints Testing Results</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${total}</div>
                <div class="stat-label">API Test Suites</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number time">${totalTime}s</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>
        
        <div class="results">
            <h2>🔗 API Test Results</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
            <p style="text-align: center; margin-bottom: 20px; color: #6c757d;">
                API Success Rate: <strong>${successRate}%</strong>
            </p>
            
            ${details.map((detail, index) => `
                <div class="test-item ${detail.success ? 'success' : 'failure'}">
                    <div class="test-name">
                        <span class="icon">${detail.success ? '✅' : '❌'}</span>
                        ${detail.name}
                        <span class="api-badge">API</span>
                    </div>
                    <div class="test-status">
                        <span class="duration">${detail.duration}s</span>
                        <span class="status-badge ${detail.success ? 'pass' : 'fail'}">
                            ${detail.success ? 'PASSED' : 'FAILED'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Generated:</strong> ${timestamp}</p>
            <p><strong>Framework:</strong> Cypress API Testing | <strong>Pattern:</strong> Service Object Model</p>
            <p><strong>Backend:</strong> RemWaste API Server | <strong>Endpoints:</strong> Authentication, Health, CRUD</p>
        </div>
    </div>
    
    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Animate progress bar
            const progressBar = document.querySelector('.progress-fill');
            setTimeout(() => {
                progressBar.style.width = '${successRate}%';
            }, 500);
            
            // Add click handlers for test items
            const testItems = document.querySelectorAll('.test-item');
            testItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
        });
    </script>
</body>
</html>`;

  return html;
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('RemWaste API Test Runner - Automated Execution', 'bright');
  log('Usage: node apiTestRunner.js [options]', 'blue');
  log('', 'reset');
  log('Options:', 'blue');
  log('  --help, -h       Show this help message', 'blue');
  log('  --headed         Run tests with browser visible', 'blue');
  log('  --visible        Same as --headed', 'blue');
  log('', 'reset');
  log('Examples:', 'cyan');
  log('  node apiTestRunner.js                 # Run headless', 'cyan');
  log('  node apiTestRunner.js --headed        # Run with browser visible', 'cyan');
  log('  npm run test:api:auto                 # Run via npm script', 'cyan');
  log('  npm run test:api:open                 # Run with browser visible', 'cyan');
  process.exit(0);
}

// Welcome message
log('🚀 Starting automated API test execution...', 'cyan');
log('⚡ API tests will run automatically in the correct sequence', 'cyan');

// Run the tests
runApiTests().catch((error) => {
  log(`❌ API test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
