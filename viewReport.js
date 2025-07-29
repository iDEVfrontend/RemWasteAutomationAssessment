#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Find the latest report
function findLatestReport() {
  const reportsDir = path.join(__dirname, 'cypress', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log('❌ No reports directory found');
    return null;
  }
  
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => {
      const filePath = path.join(reportsDir, file);
      const stats = fs.statSync(filePath);
      return { file, path: filePath, mtime: stats.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);
  
  return files.length > 0 ? files[0] : null;
}

// Find Chrome executable
function findChrome() {
  const commonChromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
    '/usr/bin/google-chrome', // Linux
    '/usr/bin/chromium-browser' // Linux alternative
  ];
  
  for (const chromePath of commonChromePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }
  
  return null;
}

// Open report in Chrome specifically
function openReportWithChrome(reportPath, forceChrome = true) {
  if (forceChrome) {
    const chromePath = findChrome();
    
    if (chromePath) {
      console.log('🌐 Opening with Chrome browser...');
      exec(`"${chromePath}" "${reportPath}"`, (error) => {
        if (error) {
          console.log('❌ Could not open with Chrome, trying default browser');
          openWithDefaultBrowser(reportPath);
        } else {
          console.log('✅ Report opened in Chrome');
        }
      });
    } else {
      console.log('❌ Chrome not found, using default browser');
      openWithDefaultBrowser(reportPath);
    }
  } else {
    openWithDefaultBrowser(reportPath);
  }
}

// Open report in browser
function openReport(forceChrome = true) {
  const latest = findLatestReport();
  
  if (!latest) {
    console.log('📊 No HTML reports found.');
    console.log('💡 Run tests first to generate a report:');
    console.log('   npm run test:pom:auto');
    return;
  }
  
  console.log(`📊 Opening latest report: ${latest.file}`);
  console.log(`📍 Location: ${latest.path}`);
  
  openReportWithChrome(latest.path, forceChrome);
}

// List all reports
function listReports() {
  const reportsDir = path.join(__dirname, 'cypress', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log('📊 No reports directory found');
    return;
  }
  
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'));
  
  if (files.length === 0) {
    console.log('📊 No HTML reports found');
    console.log('💡 Run tests first: npm run test:pom:auto');
    return;
  }
  
  console.log(`📊 Found ${files.length} report(s):`);
  files.forEach((file, index) => {
    const filePath = path.join(reportsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${index + 1}. ${file} (${stats.mtime.toLocaleString()})`);
  });
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('📊 RemWaste Test Report Viewer');
    console.log('Usage: node viewReport.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --list, -l         List all available reports');
    console.log('  --chrome, -c       Force open with Chrome browser (default)');
    console.log('  --default, -d      Open with default browser');
    console.log('  --help, -h         Show this help');
    console.log('  (no args)          Open latest report with Chrome');
    console.log('');
    console.log('Examples:');
    console.log('  node viewReport.js              # Open with Chrome');
    console.log('  node viewReport.js --chrome     # Force Chrome');
    console.log('  node viewReport.js --default    # Use default browser');
    return;
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    listReports();
    return;
  }
  
  // Determine browser preference
  const useDefaultBrowser = args.includes('--default') || args.includes('-d');
  const forceChrome = !useDefaultBrowser; // Default to Chrome unless --default specified
  
  if (forceChrome) {
    console.log('🌐 Attempting to open with Chrome browser...');
  } else {
    console.log('🌐 Opening with default browser...');
  }
  
  openReport(forceChrome);
}

main();
