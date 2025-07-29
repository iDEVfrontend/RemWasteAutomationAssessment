const fs = require('fs');
const path = require('path');

/**
 * Generate HTML test report from test results
 * @param {Object} results - Test execution results
 * @returns {string} HTML report content
 */
function generateTestReport(results) {
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
    <title>RemWaste POM Test Report</title>
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
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
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
            <h1>🧪 RemWaste Test Report</h1>
            <p>POM (Page Object Model) Test Execution Results</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${total}</div>
                <div class="stat-label">Total Tests</div>
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
            <h2>📋 Test Results</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
            <p style="text-align: center; margin-bottom: 20px; color: #6c757d;">
                Success Rate: <strong>${successRate}%</strong>
            </p>
            
            ${details.map((detail, index) => `
                <div class="test-item ${detail.success ? 'success' : 'failure'}">
                    <div class="test-name">
                        <span class="icon">${detail.success ? '✅' : '❌'}</span>
                        ${detail.name}
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
            <p><strong>Framework:</strong> Cypress E2E Testing | <strong>Pattern:</strong> Page Object Model</p>
            <p><strong>Application:</strong> RemWaste Waste Management System</p>
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

/**
 * Save HTML report to file
 * @param {string} html - HTML content to save
 * @param {string} filename - Filename for the report
 * @returns {string} Full path to saved report
 */
function saveReport(html, filename) {
  // Ensure reports directory exists
  const reportsDir = path.join(__dirname, 'cypress', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Save the report
  const reportPath = path.join(reportsDir, filename);
  fs.writeFileSync(reportPath, html, 'utf8');
  
  return reportPath;
}

module.exports = {
  generateTestReport,
  saveReport
};