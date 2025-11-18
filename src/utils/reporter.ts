import chalk from 'chalk';
import { DiagnosisResult, HealthScore, Symptom } from '../types';
import { getHealthStatus } from '../analyzer/scorer';

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
    chalk.bold('プロジェクト健康診断レポート'),
    '',
    `総合健康スコア: ${statusColor.bold(score.overall + '/100')} ${status.emoji} ${statusColor(status.label)}`,
    '',
    chalk.bold('📊 詳細スコア:'),
  ];

  const scores = [
    { label: '鮮度スコア', value: score.freshness },
    { label: 'セキュリティ', value: score.security },
    { label: '複雑度', value: score.complexity },
    { label: 'メンテナンス性', value: score.maintainability },
    { label: 'パフォーマンス', value: score.performance },
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
    return chalk.green('\n✅ 症状は検出されませんでした。プロジェクトは健康です！\n');
  }

  const lines = ['\n🏥 検出された症状:', '━'.repeat(60), ''];

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

    lines.push(chalk.bold(`${severityEmoji} 重症度: ${severityLabel}`));
    lines.push(chalk.bold(`症状: "${symptom.name}"`));
    lines.push(`説明: ${symptom.description}`);

    if (symptom.affectedPackages.length > 0) {
      lines.push(chalk.gray('影響パッケージ:'));
      symptom.affectedPackages.slice(0, 5).forEach(pkg => {
        lines.push(chalk.gray(`  - ${pkg}`));
      });
      if (symptom.affectedPackages.length > 5) {
        lines.push(chalk.gray(`  ... 他${symptom.affectedPackages.length - 5}件`));
      }
    }

    lines.push(chalk.cyan('処方箋:'));
    symptom.remedy.forEach((remedy, i) => {
      lines.push(chalk.cyan(`  ${i + 1}. ${remedy}`));
    });

    lines.push(chalk.yellow(`影響: ${symptom.impact}`));

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
    '\n📋 サマリー:',
    '━'.repeat(60),
    `総依存関係数: ${metrics.totalDependencies}`,
    `古いパッケージ: ${metrics.outdatedCount}`,
    `非推奨パッケージ: ${metrics.deprecatedCount}`,
    `平均年齢: ${Math.round(metrics.averageAge / 30)}ヶ月`,
    `検出された症状: ${symptoms.length}件`,
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
    return chalk.green('\n✨ 推奨アクション: なし。プロジェクトは健康な状態です！\n');
  }

  const lines = ['\n💡 推奨アクション:', '━'.repeat(60), ''];

  if (score.freshness < 60) {
    lines.push('📅 優先度 HIGH:');
    lines.push('  - npm update で依存関係を更新');
    lines.push('  - 非推奨パッケージの代替品を調査');
    lines.push('');
  }

  if (score.security < 70) {
    lines.push('🔒 優先度 HIGH:');
    lines.push('  - npm audit でセキュリティチェック');
    lines.push('  - npm audit fix で自動修復を試行');
    lines.push('');
  }

  if (score.complexity < 70) {
    lines.push('🧹 優先度 MEDIUM:');
    lines.push('  - depcheck で未使用パッケージを検出');
    lines.push('  - 不要な依存関係を削除');
    lines.push('');
  }

  lines.push(chalk.cyan('🤖 次のステップ:'));
  lines.push(chalk.cyan('  1. 定期的な依存関係レビューをスケジュール'));
  lines.push(chalk.cyan('  2. Renovate や Dependabot の導入を検討'));
  lines.push(chalk.cyan('  3. CI/CD に dependency-therapist を統合'));
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
    chalk.gray(`\n診断日時: ${result.timestamp.toLocaleString('ja-JP')}`),
    chalk.gray(`プロジェクトパス: ${result.projectPath}\n`),
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
