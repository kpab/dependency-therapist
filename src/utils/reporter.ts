import chalk from 'chalk';
import { DiagnosisResult, HealthScore, Symptom } from '../types';
import { getHealthStatus } from '../analyzer/scorer';
import { t } from '../i18n';

/**
 * ボックスを描画
 */
function drawBox(content: string[], width: number = 60): string {
  const lines = [];
  lines.push('┌' + '─'.repeat(width - 2) + '┐');

  content.forEach(line => {
    const padding = width - 4 - line.replace(/\u001b\[[0-9;]*m/g, '').length;
    lines.push('│ ' + line + ' '.repeat(Math.max(0, padding)) + ' │');
  });

  lines.push('└' + '─'.repeat(width - 2) + '┘');
  return lines.join('\n');
}

/**
 * スコアバーを描画
 */
function drawScoreBar(score: number, width: number = 30): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;

  let color = chalk.red;
  if (score >= 80) color = chalk.green;
  else if (score >= 60) color = chalk.yellow;

  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

/**
 * 健康スコアレポートを生成
 */
function generateScoreReport(score: HealthScore): string {
  const status = getHealthStatus(score.overall);
  const statusColor = status.color === 'green' ? chalk.green : status.color === 'yellow' ? chalk.yellow : chalk.red;

  const lines = [
    chalk.bold(t('projectHealthReport')),
    '',
    `${t('overallHealthScore')}: ${statusColor.bold(score.overall + '/100')} ${status.emoji} ${statusColor(status.label)}`,
    '',
    chalk.bold(`📊 ${t('detailedScores')}:`),
  ];

  const scores = [
    { label: t('freshness'), value: score.freshness },
    { label: t('security'), value: score.security },
    { label: t('complexity'), value: score.complexity },
    { label: t('maintainability'), value: score.maintainability },
    { label: t('performance'), value: score.performance },
  ];

  scores.forEach(({ label, value }) => {
    const status = getHealthStatus(value);
    const bar = drawScoreBar(value, 20);
    lines.push(`├─ ${label}: ${value}/100 ${status.emoji} ${bar}`);
  });

  return drawBox(lines, 70);
}

/**
 * 症状レポートを生成
 */
function generateSymptomsReport(symptoms: Symptom[]): string {
  if (symptoms.length === 0) {
    return chalk.green(`\n✅ ${t('noSymptomsDetected')}\n`);
  }

  const lines = [`\n🏥 ${t('symptomsDetected')}:`, '━'.repeat(60), ''];

  symptoms.forEach((symptom, index) => {
    const severityEmoji = {
      critical: '🔴',
      high: '⚠️ ',
      medium: '🔍',
      low: '💊',
    }[symptom.severity];

    const severityLabel = {
      critical: 'CRITICAL',
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
    }[symptom.severity];

    lines.push(chalk.bold(`${severityEmoji} ${t('severity')}: ${severityLabel}`));
    lines.push(chalk.bold(`${t('symptom')}: "${symptom.name}"`));
    lines.push(`${t('description')}: ${symptom.description}`);

    if (symptom.affectedPackages.length > 0) {
      lines.push(chalk.gray(`${t('affectedPackages')}:`));
      symptom.affectedPackages.slice(0, 5).forEach(pkg => {
        lines.push(chalk.gray(`  - ${pkg}`));
      });
      if (symptom.affectedPackages.length > 5) {
        lines.push(chalk.gray(`  ... ${t('andMore', { count: symptom.affectedPackages.length - 5 })}`));
      }
    }

    lines.push(chalk.cyan(`${t('prescription')}:`));
    symptom.remedy.forEach((remedy, i) => {
      lines.push(chalk.cyan(`  ${i + 1}. ${remedy}`));
    });

    lines.push(chalk.yellow(`${t('impact')}: ${symptom.impact}`));

    if (index < symptoms.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\n');
}

/**
 * サマリーレポートを生成
 */
function generateSummary(result: DiagnosisResult): string {
  const { metrics, symptoms } = result;

  const lines = [
    `\n📋 ${t('summary')}:`,
    '━'.repeat(60),
    `${t('totalDependencies')}: ${metrics.totalDependencies}`,
    `${t('outdatedPackages')}: ${metrics.outdatedCount}`,
    `${t('deprecatedPackages')}: ${metrics.deprecatedCount}`,
    `${t('averageAge')}: ${Math.round(metrics.averageAge / 30)}${t('months')}`,
    `${t('detectedSymptoms')}: ${symptoms.length}`,
    '',
  ];

  return lines.join('\n');
}

/**
 * 推奨アクションを生成
 */
function generateRecommendations(result: DiagnosisResult): string {
  const { score, symptoms } = result;

  if (score.overall >= 80 && symptoms.length === 0) {
    return chalk.green(`\n✨ ${t('noRecommendations')}\n`);
  }

  const lines = [`\n💡 ${t('recommendations')}:`, '━'.repeat(60), ''];

  if (score.freshness < 60) {
    lines.push(`📅 ${t('priorityHigh')}:`);
    lines.push(`  - ${t('updateDeps')}`);
    lines.push(`  - ${t('investigateAlternatives')}`);
    lines.push('');
  }

  if (score.security < 70) {
    lines.push(`🔒 ${t('priorityHigh')}:`);
    lines.push(`  - ${t('runAudit')}`);
    lines.push(`  - ${t('runAuditFix')}`);
    lines.push('');
  }

  if (score.complexity < 70) {
    lines.push(`🧹 ${t('priorityMedium')}:`);
    lines.push(`  - ${t('useDepcheck')}`);
    lines.push(`  - ${t('removeUnused')}`);
    lines.push('');
  }

  lines.push(chalk.cyan(`🤖 ${t('nextSteps')}:`));
  lines.push(chalk.cyan(`  1. ${t('scheduleReview')}`));
  lines.push(chalk.cyan(`  2. ${t('introduceAutomation')}`));
  lines.push(chalk.cyan(`  3. ${t('integrateCICD')}`));
  lines.push('');

  return lines.join('\n');
}

/**
 * 完全なレポートを生成
 */
export function generateReport(result: DiagnosisResult): string {
  const parts = [
    '\n',
    generateScoreReport(result.score),
    generateSummary(result),
    generateSymptomsReport(result.symptoms),
    generateRecommendations(result),
    chalk.gray(`\n${t('diagnosisDate')}: ${result.timestamp.toLocaleString()}`),
    chalk.gray(`${t('projectPath')}: ${result.projectPath}\n`),
  ];

  return parts.join('\n');
}

/**
 * シンプルなサマリーを生成（CI/CD用）
 */
export function generateSimpleSummary(result: DiagnosisResult): string {
  const status = getHealthStatus(result.score.overall);
  return `Health Score: ${result.score.overall}/100 ${status.emoji} | Symptoms: ${result.symptoms.length}`;
}
