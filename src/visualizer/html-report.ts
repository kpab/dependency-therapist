import * as fs from 'fs';
import * as path from 'path';
import { DiagnosisResult } from '../types';
import { getHealthStatus } from '../analyzer/scorer';

/**
 * SVG Icons (Heroicons)
 */
const icons = {
  hospital: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>`,
  beaker: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  exclamation: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>`,
  cube: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  bolt: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`,
  wrench: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>`,
};

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
    :root {
      /* Developer Tool Dark Theme */
      --color-primary: #3B82F6;
      --color-primary-hover: #2563EB;
      --color-secondary: #1E293B;
      --color-background: #0F172A;
      --color-surface: #1E293B;
      --color-surface-hover: #334155;
      --color-text: #F1F5F9;
      --color-text-muted: #94A3B8;
      --color-border: #334155;

      /* Status Colors */
      --color-success: #22C55E;
      --color-warning: #F59E0B;
      --color-danger: #EF4444;
      --color-info: #3B82F6;

      /* Severity Colors */
      --color-critical: #EF4444;
      --color-high: #F97316;
      --color-medium: #F59E0B;
      --color-low: #22C55E;

      /* Animation */
      --transition-fast: 150ms ease-out;
      --transition-normal: 200ms ease-out;
      --transition-slow: 300ms ease-out;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'JetBrains Mono', monospace;
      background: var(--color-background);
      color: var(--color-text);
      padding: 24px;
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: var(--color-surface);
      border-radius: 16px;
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    /* Icons */
    .icon {
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: middle;
    }

    .icon-sm {
      width: 16px;
      height: 16px;
    }

    .icon-lg {
      width: 32px;
      height: 32px;
    }

    /* Header */
    header {
      background: linear-gradient(135deg, var(--color-primary) 0%, #1D4ED8 100%);
      color: white;
      padding: 48px;
      text-align: center;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      font-weight: 400;
    }

    /* Section Headers */
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h2 .icon {
      color: var(--color-primary);
    }

    /* Score Section */
    .score-section {
      padding: 48px;
      text-align: center;
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
    }

    .overall-score {
      font-size: 5rem;
      font-weight: 800;
      color: ${status.color === 'green' ? 'var(--color-success)' : status.color === 'yellow' ? 'var(--color-warning)' : 'var(--color-danger)'};
      margin: 24px 0;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.04em;
    }

    .score-label {
      font-size: 1.1rem;
      color: var(--color-text-muted);
      margin-bottom: 16px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.95rem;
      background: ${status.color === 'green' ? 'rgba(34, 197, 94, 0.15)' : status.color === 'yellow' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
      color: ${status.color === 'green' ? 'var(--color-success)' : status.color === 'yellow' ? 'var(--color-warning)' : 'var(--color-danger)'};
      border: 1px solid ${status.color === 'green' ? 'rgba(34, 197, 94, 0.3)' : status.color === 'yellow' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    }

    .detailed-scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 40px;
    }

    .score-card {
      background: var(--color-surface);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .score-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 1px var(--color-primary);
    }

    .score-card h3 {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 500;
    }

    .score-card .value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 12px;
      font-variant-numeric: tabular-nums;
    }

    .score-bar {
      height: 6px;
      background: var(--color-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width var(--transition-slow);
    }

    /* Metrics Section */
    .metrics-section {
      padding: 40px 48px;
      border-bottom: 1px solid var(--color-border);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: var(--color-background);
      padding: 20px;
      border-radius: 12px;
      border-left: 3px solid var(--color-primary);
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .metric-card:hover {
      background: var(--color-surface-hover);
    }

    .metric-card .label {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .metric-card .label .icon {
      width: 16px;
      height: 16px;
    }

    .metric-card .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text);
      font-variant-numeric: tabular-nums;
    }

    /* Symptoms Section */
    .symptoms-section {
      padding: 40px 48px;
    }

    .symptom {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      transition: all var(--transition-normal);
      cursor: pointer;
    }

    .symptom:hover {
      border-color: var(--color-primary);
    }

    .symptom.critical {
      border-left: 4px solid var(--color-critical);
    }

    .symptom.high {
      border-left: 4px solid var(--color-high);
    }

    .symptom.medium {
      border-left: 4px solid var(--color-medium);
    }

    .symptom.low {
      border-left: 4px solid var(--color-low);
    }

    .symptom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .symptom-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .severity-badge {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .severity-badge.critical {
      background: rgba(239, 68, 68, 0.15);
      color: var(--color-critical);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .severity-badge.high {
      background: rgba(249, 115, 22, 0.15);
      color: var(--color-high);
      border: 1px solid rgba(249, 115, 22, 0.3);
    }

    .severity-badge.medium {
      background: rgba(245, 158, 11, 0.15);
      color: var(--color-medium);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .severity-badge.low {
      background: rgba(34, 197, 94, 0.15);
      color: var(--color-low);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .symptom-description {
      color: var(--color-text-muted);
      margin-bottom: 12px;
      font-size: 0.95rem;
    }

    .remedy-section {
      background: var(--color-surface);
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .remedy-section h4 {
      color: var(--color-primary);
      margin-bottom: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .remedy-list {
      list-style: none;
      padding: 0;
    }

    .remedy-list li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }

    .remedy-list li:before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: var(--color-primary);
      border-radius: 50%;
    }

    .affected-packages {
      margin-top: 12px;
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .affected-packages code {
      background: var(--color-surface);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    /* Footer */
    footer {
      padding: 32px 48px;
      background: var(--color-background);
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      border-top: 1px solid var(--color-border);
    }

    footer p {
      margin-bottom: 8px;
    }

    footer strong {
      color: var(--color-text);
    }

    .footer-brand {
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--color-text-muted);
    }

    .footer-brand .icon {
      color: var(--color-primary);
    }

    /* No Symptoms */
    .no-symptoms {
      text-align: center;
      padding: 60px 40px;
      color: var(--color-success);
      font-size: 1.2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .no-symptoms .icon {
      width: 48px;
      height: 48px;
    }

    /* Accessibility - Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }

      .score-bar-fill {
        transition: none;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 16px;
      }

      header {
        padding: 32px 24px;
      }

      .score-section,
      .metrics-section,
      .symptoms-section {
        padding: 32px 24px;
      }

      footer {
        padding: 24px;
      }

      .detailed-scores,
      .metrics-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 1.5rem;
      }

      .overall-score {
        font-size: 3.5rem;
      }

      .symptom-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* Focus States for Keyboard Navigation */
    .score-card:focus-visible,
    .metric-card:focus-visible,
    .symptom:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      ${icons.hospital.replace('class="icon"', 'class="icon header-icon"')}
      <h1>Dependency Therapist</h1>
      <p class="subtitle">Health Diagnosis Report</p>
    </header>

    <div class="score-section">
      <div class="score-label">Overall Health Score</div>
      <div class="overall-score">${score.overall}<span style="font-size: 0.4em; color: var(--color-text-muted);">/100</span></div>
      <div class="status-badge">
        ${status.color === 'green' ? icons.check.replace('class="icon"', 'class="icon icon-sm"') : icons.exclamation.replace('class="icon"', 'class="icon icon-sm"')}
        ${status.label}
      </div>

      <div class="detailed-scores">
        ${generateScoreCard('Freshness', score.freshness, icons.clock)}
        ${generateScoreCard('Security', score.security, icons.shield)}
        ${generateScoreCard('Complexity', score.complexity, icons.cube)}
        ${generateScoreCard('Maintainability', score.maintainability, icons.wrench)}
        ${generateScoreCard('Performance', score.performance, icons.bolt)}
      </div>
    </div>

    <div class="metrics-section">
      <h2>${icons.chart} Project Metrics</h2>
      <div class="metrics-grid">
        ${generateMetricCard('Total Dependencies', metrics.totalDependencies, icons.cube)}
        ${generateMetricCard('Outdated Packages', metrics.outdatedCount, icons.clock)}
        ${generateMetricCard('Deprecated Packages', metrics.deprecatedCount, icons.exclamation)}
        ${generateMetricCard('Vulnerabilities', metrics.vulnerabilities, icons.shield)}
        ${generateMetricCard('Average Age (months)', Math.round(metrics.averageAge / 30), icons.clock)}
        ${generateMetricCard('Detected Symptoms', symptoms.length, icons.search)}
      </div>
    </div>

    <div class="symptoms-section">
      <h2>${icons.search} Detected Symptoms</h2>
      ${symptoms.length === 0
        ? `<div class="no-symptoms">${icons.check.replace('class="icon"', 'class="icon"')}No symptoms detected. Your project is healthy!</div>`
        : symptoms.map(symptom => generateSymptomCard(symptom)).join('')
      }
    </div>

    <footer>
      <p><strong>Generated:</strong> ${timestamp.toLocaleString()}</p>
      <p><strong>Project:</strong> ${projectPath}</p>
      <div class="footer-brand">
        ${icons.hospital.replace('class="icon"', 'class="icon icon-sm"')}
        <span>dependency-therapist - Your project's physician</span>
      </div>
    </footer>
  </div>

  <script>
    // Animate score bars with requestAnimationFrame for better performance
    document.addEventListener('DOMContentLoaded', () => {
      const bars = document.querySelectorAll('.score-bar-fill');

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      bars.forEach((bar, index) => {
        const width = bar.getAttribute('data-width');
        if (prefersReducedMotion) {
          bar.style.width = width + '%';
        } else {
          // Stagger animations for visual effect
          setTimeout(() => {
            requestAnimationFrame(() => {
              bar.style.width = width + '%';
            });
          }, index * 100);
        }
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Generate score card HTML
 */
function generateScoreCard(label: string, value: number, icon: string): string {
  const status = getHealthStatus(value);
  const color = status.color === 'green' ? 'var(--color-success)' : status.color === 'yellow' ? 'var(--color-warning)' : 'var(--color-danger)';

  return `
    <div class="score-card" tabindex="0" role="button" aria-label="${label}: ${value} out of 100">
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
function generateMetricCard(label: string, value: number, icon: string): string {
  return `
    <div class="metric-card" tabindex="0" role="button" aria-label="${label}: ${value}">
      <div class="label">${icon.replace('class="icon"', 'class="icon"')} ${label}</div>
      <div class="value">${value}</div>
    </div>
  `;
}

/**
 * Generate symptom card HTML
 */
function generateSymptomCard(symptom: any): string {
  return `
    <div class="symptom ${symptom.severity}" tabindex="0" role="article" aria-label="${symptom.name}, severity: ${symptom.severity}">
      <div class="symptom-header">
        <div class="symptom-name">${symptom.name}</div>
        <span class="severity-badge ${symptom.severity}">${symptom.severity}</span>
      </div>
      <div class="symptom-description">${symptom.description}</div>
      <div class="symptom-description"><strong>Impact:</strong> ${symptom.impact}</div>
      ${symptom.affectedPackages && symptom.affectedPackages.length > 0 ? `
        <div class="affected-packages">
          <strong>Affected Packages:</strong><br>
          ${symptom.affectedPackages.slice(0, 5).map((pkg: string) => `<code>${pkg}</code>`).join(' ')}
          ${symptom.affectedPackages.length > 5 ? `<br><em style="color: var(--color-text-muted);">... and ${symptom.affectedPackages.length - 5} more</em>` : ''}
        </div>
      ` : ''}
      <div class="remedy-section">
        <h4>${icons.beaker.replace('class="icon"', 'class="icon icon-sm"')} Prescription</h4>
        <ul class="remedy-list">
          ${symptom.remedy.map((r: string) => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}
