import chalk from 'chalk';
import asciichart from 'asciichart';
import Chartscii from 'chartscii';
import { Dependency, ProjectMetrics, Symptom, HealthScore } from '../types';
import { getHealthStatus } from '../analyzer/scorer';

/**
 * 強化版スコアゲージを描画
 */
export function drawEnhancedGauge(score: number, label: string, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;

  let color = chalk.red;
  if (score >= 80) color = chalk.green;
  else if (score >= 60) color = chalk.yellow;

  const bar = color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  const status = getHealthStatus(score);

  return `${label.padEnd(14)} ${bar} ${String(score).padStart(3)} ${status.emoji}`;
}

/**
 * 全スコアのゲージを描画
 */
export function drawAllScoreGauges(score: HealthScore): string {
  const lines: string[] = [];

  lines.push(chalk.bold('📊 ヘルススコア可視化'));
  lines.push('─'.repeat(50));
  lines.push('');

  // 総合スコア（大きめ）
  const overallStatus = getHealthStatus(score.overall);
  const overallFilled = Math.round((score.overall / 100) * 30);
  const overallEmpty = 30 - overallFilled;
  let overallColor = chalk.red;
  if (score.overall >= 80) overallColor = chalk.green;
  else if (score.overall >= 60) overallColor = chalk.yellow;

  lines.push(chalk.bold('総合スコア:'));
  lines.push(overallColor('█'.repeat(overallFilled)) + chalk.gray('░'.repeat(overallEmpty)) + ` ${score.overall}/100 ${overallStatus.emoji} ${overallStatus.label}`);
  lines.push('');

  // 詳細スコア
  lines.push(chalk.bold('詳細:'));
  lines.push(drawEnhancedGauge(score.freshness, '  鮮度'));
  lines.push(drawEnhancedGauge(score.security, '  セキュリティ'));
  lines.push(drawEnhancedGauge(score.complexity, '  複雑度'));
  lines.push(drawEnhancedGauge(score.maintainability, '  メンテナンス'));
  lines.push(drawEnhancedGauge(score.performance, '  パフォーマンス'));

  return lines.join('\n');
}

/**
 * パッケージ年齢分布チャートを描画
 */
export function drawAgeDistribution(dependencies: Dependency[]): string {
  if (dependencies.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('');
  lines.push(chalk.bold('📈 パッケージ年齢分布'));
  lines.push('─'.repeat(50));

  // 年齢グループに分類
  const groups = {
    '0-3ヶ月': 0,
    '3-6ヶ月': 0,
    '6-12ヶ月': 0,
    '1年以上': 0,
  };

  dependencies.forEach(dep => {
    const months = dep.lastUpdateDays / 30;
    if (months < 3) groups['0-3ヶ月']++;
    else if (months < 6) groups['3-6ヶ月']++;
    else if (months < 12) groups['6-12ヶ月']++;
    else groups['1年以上']++;
  });

  // asciichartでプロット
  const data = Object.values(groups);
  if (data.some(v => v > 0)) {
    const chart = asciichart.plot(data, {
      height: 6,
      padding: '       ',
      format: (x: number) => x.toFixed(0).padStart(3),
    });
    lines.push(chart);
    lines.push('       ' + Object.keys(groups).join('  '));
  }

  return lines.join('\n');
}

/**
 * 症状の重症度内訳を描画
 */
export function drawSeverityBreakdown(symptoms: Symptom[]): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(chalk.bold('🏥 症状の重症度内訳'));
  lines.push('─'.repeat(50));

  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  symptoms.forEach(s => {
    severityCounts[s.severity]++;
  });

  const data = [
    { label: 'Critical', value: severityCounts.critical, color: 'red' },
    { label: 'High', value: severityCounts.high, color: 'yellow' },
    { label: 'Medium', value: severityCounts.medium, color: 'cyan' },
    { label: 'Low', value: severityCounts.low, color: 'green' },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 25;

  data.forEach(({ label, value, color }) => {
    const filled = Math.round((value / maxValue) * barWidth);
    const empty = barWidth - filled;
    const colorFn = (chalk as any)[color] || chalk.white;
    const bar = colorFn('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    lines.push(`  ${label.padEnd(10)} ${bar} ${value}`);
  });

  return lines.join('\n');
}

/**
 * 依存関係のステータス内訳を描画
 */
export function drawDependencyStatus(metrics: ProjectMetrics): string {
  const lines: string[] = [];
  lines.push('');
  lines.push(chalk.bold('📦 依存関係の状態'));
  lines.push('─'.repeat(50));

  const upToDate = metrics.totalDependencies - metrics.outdatedCount - metrics.deprecatedCount;

  const data = [
    { label: '最新', value: Math.max(0, upToDate), color: 'green' },
    { label: '古い', value: metrics.outdatedCount, color: 'yellow' },
    { label: '非推奨', value: metrics.deprecatedCount, color: 'red' },
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = 25;

  data.forEach(({ label, value, color }) => {
    const filled = Math.round((value / maxValue) * barWidth);
    const empty = barWidth - filled;
    const colorFn = (chalk as any)[color] || chalk.white;
    const bar = colorFn('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    lines.push(`  ${label.padEnd(8)} ${bar} ${value}`);
  });

  // 重複情報も表示
  if (metrics.duplicates > 0) {
    lines.push('');
    lines.push(chalk.yellow(`  重複パッケージ: ${metrics.duplicates}個`));
  }

  return lines.join('\n');
}

/**
 * すべてのチャートを生成
 */
export function generateCharts(
  score: HealthScore,
  metrics: ProjectMetrics,
  symptoms: Symptom[]
): string {
  const parts: string[] = [];

  parts.push('\n' + '═'.repeat(50));
  parts.push(chalk.bold.cyan('        📊 インタラクティブ可視化'));
  parts.push('═'.repeat(50));

  parts.push(drawAllScoreGauges(score));
  parts.push(drawAgeDistribution(metrics.dependencies));
  parts.push(drawSeverityBreakdown(symptoms));
  parts.push(drawDependencyStatus(metrics));

  parts.push('\n' + '═'.repeat(50));

  return parts.join('\n');
}
