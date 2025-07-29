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
    log('✅ Found Chrome, opening report...', 'green');
    exec(`"${chromePath}" "${reportPath}"`, (error) => {
      if (error) {
        log('❌ Could not open with Chrome, check the report manually', 'yellow');
        log(`📄 Report location: ${reportPath}`, 'blue');
      } else {
        log('🎊 Report opened successfully in Chrome!', 'green');
      }
    });
  } else {
    log('❌ Chrome not found, check the report manually', 'yellow');
    log(`📄 Report location: ${reportPath}`, 'blue');
  }
};

// POM Test Suites in correct execution order
const pomTestSuites = [
  {
    name: 'POM Login Tests',
    spec: 'cypress/e2e/CrudAutomation/login-pom.cy.js',
    description: 'Running comprehensive login tests with POM structure',
    critical: true
  },
  {
    name: 'POM Dashboard Tests', 
    spec: 'cypress/e2e/CrudAutomation/dashboard-pom.cy.js',
    description: 'Running CRUD dashboard tests with POM structure',
    critical: true
  }
];

// Main POM test runner function
async function runPomTests() {
  log('🎯 RemWaste POM Test Suite - Automated Execution', 'bright');
  log('==================================================', 'bright');
  log('📋 Tests will run automatically in sequence:', 'blue');
  log('   1. Login Tests (authentication & security)', 'blue');
  log('   2. Dashboard Tests (CRUD operations)', 'blue');
  log('', 'reset');
  
  const results = {
    total: pomTestSuites.length,
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
  for (let i = 0; i < pomTestSuites.length; i++) {
    const suite = pomTestSuites[i];
    
    log(`\n📋 Test ${i + 1} of ${pomTestSuites.length}`, 'bright');
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
        // Don't stop execution - continue to next test suite
      }
    }
    
    // Brief pause between test suites
    if (i < pomTestSuites.length - 1) {
      log('⏳ Preparing next test suite...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Generate comprehensive summary
  const totalTime = ((Date.now() - results.startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(60), 'bright');
  log('📊 FINAL TEST EXECUTION SUMMARY', 'bright');
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
    log('\n🎉 SUCCESS: ALL POM TESTS COMPLETED SUCCESSFULLY!', 'green');
    log('🏆 Your POM framework is working perfectly!', 'green');
  } else if (results.passed > 0) {
    log(`\n⚠️  PARTIAL SUCCESS: ${results.passed}/${results.total} test suites passed`, 'yellow');
    log('🔍 Check the detailed results above for specific failures', 'yellow');
  } else {
    log('\n💥 ALL TESTS FAILED', 'red');
    log('🔍 Check cypress/screenshots/ and cypress/videos/ for debug info', 'yellow');
  }
  
  // Generate and auto-open HTML report
  try {
    const html = generateTestReport(results);
    const reportPath = saveReport(html, `pom-test-report-${Date.now()}.html`);
    log('\n📊 Generated HTML Report:', 'bright');
    log(`   📄 ${reportPath}`, 'blue');
    
    // Auto-open report in Chrome if tests completed (regardless of pass/fail)
    log('\n🌐 Opening report in Chrome browser...', 'cyan');
    openReportInChrome(reportPath);
    
  } catch (error) {
    log('\n⚠️ Could not generate HTML report:', 'yellow');
    log(`   Error: ${error.message}`, 'yellow');
  }
  
  log('\n📁 Other Generated Files:', 'bright');
  log('   📹 Videos: cypress/videos/', 'blue');
  if (results.failed > 0) {
    log('   📷 Screenshots: cypress/screenshots/', 'blue');
  }
  log('   📷 Screenshots: cypress/screenshots/ (if failures occurred)', 'blue');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('RemWaste POM Test Runner - Automated Execution', 'bright');
  log('Usage: node pomTestRunner.js [options]', 'blue');
  log('', 'reset');
  log('Options:', 'blue');
  log('  --help, -h       Show this help message', 'blue');
  log('  --headed         Run tests with browser visible', 'blue');
  log('  --visible        Same as --headed', 'blue');
  log('', 'reset');
  log('Examples:', 'cyan');
  log('  node pomTestRunner.js                 # Run headless', 'cyan');
  log('  node pomTestRunner.js --headed        # Run with browser visible', 'cyan');
  log('  npm run test:pom:auto                 # Run via npm script', 'cyan');
  log('  npm run test:pom:open                 # Run with browser visible', 'cyan');
  process.exit(0);
}

// Welcome message
log('🚀 Starting automated POM test execution...', 'cyan');
log('⚡ Tests will run automatically in the correct sequence', 'cyan');

// Run the tests
runPomTests().catch((error) => {
  log(`❌ POM test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
