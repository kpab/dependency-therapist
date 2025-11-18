import * as fs from 'fs';
import * as path from 'path';
import { DiagnosisResult } from '../types';
import { getHealthStatus } from '../analyzer/scorer';

/**
 * Generate HTML report
 */
export async function generateHTMLReport(
  result: DiagnosisResult,
  outputPath: string
): Promise<void> {
  const html = createHTMLContent(result);
  fs.writeFileSync(outputPath, html, 'utf-8');
}

/**
 * Create HTML content
 */
function createHTMLContent(result: DiagnosisResult): string {
  const { score, metrics, symptoms, timestamp, projectPath } = result;
  const status = getHealthStatus(score.overall);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Health Report - ${path.basename(projectPath)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
    }

    .score-section {
      padding: 40px;
      text-align: center;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .overall-score {
      font-size: 5em;
      font-weight: bold;
      color: ${status.color === 'green' ? '#28a745' : status.color === 'yellow' ? '#ffc107' : '#dc3545'};
      margin: 20px 0;
    }

    .score-label {
      font-size: 1.5em;
      color: #6c757d;
      margin-bottom: 30px;
    }

    .detailed-scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .score-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .score-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .score-card h3 {
      font-size: 0.9em;
      color: #6c757d;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .score-card .value {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .score-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease;
    }

    .metrics-section {
      padding: 40px;
      border-bottom: 1px solid #dee2e6;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .metric-card .label {
      font-size: 0.9em;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .metric-card .value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }

    .symptoms-section {
      padding: 40px;
    }

    .symptom {
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .symptom:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .symptom.critical {
      border-left: 6px solid #dc3545;
      background: #fff5f5;
    }

    .symptom.high {
      border-left: 6px solid #fd7e14;
      background: #fff8f0;
    }

    .symptom.medium {
      border-left: 6px solid #ffc107;
      background: #fffef0;
    }

    .symptom.low {
      border-left: 6px solid #28a745;
      background: #f0fff4;
    }

    .symptom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .symptom-name {
      font-size: 1.3em;
      font-weight: bold;
      color: #333;
    }

    .severity-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: bold;
      text-transform: uppercase;
    }

    .severity-badge.critical {
      background: #dc3545;
      color: white;
    }

    .severity-badge.high {
      background: #fd7e14;
      color: white;
    }

    .severity-badge.medium {
      background: #ffc107;
      color: #333;
    }

    .severity-badge.low {
      background: #28a745;
      color: white;
    }

    .symptom-description {
      color: #6c757d;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .remedy-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-top: 12px;
    }

    .remedy-section h4 {
      color: #667eea;
      margin-bottom: 8px;
      font-size: 1.1em;
    }

    .remedy-list {
      list-style: none;
      padding: 0;
    }

    .remedy-list li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
    }

    .remedy-list li:before {
      content: "💊";
      position: absolute;
      left: 0;
    }

    .affected-packages {
      margin-top: 12px;
      font-size: 0.9em;
      color: #6c757d;
    }

    footer {
      padding: 30px 40px;
      background: #f8f9fa;
      text-align: center;
      color: #6c757d;
    }

    .no-symptoms {
      text-align: center;
      padding: 60px;
      color: #28a745;
      font-size: 1.5em;
    }

    @media (max-width: 768px) {
      .detailed-scores,
      .metrics-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 2em;
      }

      .overall-score {
        font-size: 3.5em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏥 Dependency Therapist</h1>
      <p class="subtitle">Health Diagnosis Report</p>
    </header>

    <div class="score-section">
      <div class="score-label">Overall Health Score</div>
      <div class="overall-score">${score.overall}/100</div>
      <div class="score-label">Status: ${status.emoji} ${status.label}</div>

      <div class="detailed-scores">
        ${generateScoreCard('Freshness', score.freshness)}
        ${generateScoreCard('Security', score.security)}
        ${generateScoreCard('Complexity', score.complexity)}
        ${generateScoreCard('Maintainability', score.maintainability)}
        ${generateScoreCard('Performance', score.performance)}
      </div>
    </div>

    <div class="metrics-section">
      <h2>📊 Project Metrics</h2>
      <div class="metrics-grid">
        ${generateMetricCard('Total Dependencies', metrics.totalDependencies)}
        ${generateMetricCard('Outdated Packages', metrics.outdatedCount)}
        ${generateMetricCard('Deprecated Packages', metrics.deprecatedCount)}
        ${generateMetricCard('Vulnerabilities', metrics.vulnerabilities)}
        ${generateMetricCard('Average Age (months)', Math.round(metrics.averageAge / 30))}
        ${generateMetricCard('Detected Symptoms', symptoms.length)}
      </div>
    </div>

    <div class="symptoms-section">
      <h2>🔍 Detected Symptoms</h2>
      ${symptoms.length === 0
        ? '<div class="no-symptoms">✅ No symptoms detected. Your project is healthy!</div>'
        : symptoms.map(symptom => generateSymptomCard(symptom)).join('')
      }
    </div>

    <footer>
      <p><strong>Generated:</strong> ${timestamp.toLocaleString()}</p>
      <p><strong>Project:</strong> ${projectPath}</p>
      <p style="margin-top: 16px;">
        <em>dependency-therapist - Your project's physician 🏥</em>
      </p>
    </footer>
  </div>

  <script>
    // Animate score bars
    document.addEventListener('DOMContentLoaded', () => {
      const bars = document.querySelectorAll('.score-bar-fill');
      bars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 100);
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Generate score card HTML
 */
function generateScoreCard(label: string, value: number): string {
  const status = getHealthStatus(value);
  const color = status.color === 'green' ? '#28a745' : status.color === 'yellow' ? '#ffc107' : '#dc3545';

  return `
    <div class="score-card">
      <h3>${label}</h3>
      <div class="value" style="color: ${color};">${value}</div>
      <div class="score-bar">
        <div class="score-bar-fill" style="background: ${color}; width: 0;" data-width="${value}"></div>
      </div>
    </div>
  `;
}

/**
 * Generate metric card HTML
 */
function generateMetricCard(label: string, value: number): string {
  return `
    <div class="metric-card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  `;
}

/**
 * Generate symptom card HTML
 */
function generateSymptomCard(symptom: any): string {
  return `
    <div class="symptom ${symptom.severity}">
      <div class="symptom-header">
        <div class="symptom-name">${symptom.name}</div>
        <span class="severity-badge ${symptom.severity}">${symptom.severity}</span>
      </div>
      <div class="symptom-description">${symptom.description}</div>
      <div class="symptom-description"><strong>Impact:</strong> ${symptom.impact}</div>
      ${symptom.affectedPackages && symptom.affectedPackages.length > 0 ? `
        <div class="affected-packages">
          <strong>Affected Packages:</strong><br>
          ${symptom.affectedPackages.slice(0, 5).join('<br>')}
          ${symptom.affectedPackages.length > 5 ? `<br><em>... and ${symptom.affectedPackages.length - 5} more</em>` : ''}
        </div>
      ` : ''}
      <div class="remedy-section">
        <h4>💊 Prescription</h4>
        <ul class="remedy-list">
          ${symptom.remedy.map((r: string) => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}
