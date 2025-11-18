import { HealthScore, ProjectMetrics, ScoreWeights } from '../types';
import { AuditResult } from './security';

/**
 * スコア計算の重み付け
 */
const DEFAULT_WEIGHTS: ScoreWeights = {
  outdated: 0.25,
  deprecated: 0.30,
  security: 0.20,
  complexity: 0.15,
  duplicates: 0.10,
};

/**
 * 0-100 の範囲にクランプ
 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 鮮度スコアを計算
 * - 古いパッケージが多いほど低スコア
 * - 非推奨パッケージは大きく減点
 */
function calculateFreshnessScore(metrics: ProjectMetrics): number {
  if (metrics.totalDependencies === 0) {
    return 100;
  }

  // 古いパッケージの割合
  const outdatedRatio = metrics.outdatedCount / metrics.totalDependencies;
  const outdatedPenalty = outdatedRatio * 50;

  // 非推奨パッケージの割合
  const deprecatedRatio = metrics.deprecatedCount / metrics.totalDependencies;
  const deprecatedPenalty = deprecatedRatio * 40;

  // 平均年齢によるペナルティ（365日以上で減点開始）
  const agePenalty = Math.min(30, Math.max(0, (metrics.averageAge - 365) / 30));

  const score = 100 - outdatedPenalty - deprecatedPenalty - agePenalty;
  return clamp(score);
}

/**
 * セキュリティスコアを計算
 */
function calculateSecurityScore(
  metrics: ProjectMetrics & { auditResult?: AuditResult }
): number {
  if (metrics.totalDependencies === 0) {
    return 100;
  }

  const deprecatedPenalty = (metrics.deprecatedCount / metrics.totalDependencies) * 20;

  // Use detailed audit data if available
  let vulnerabilityPenalty = 0;
  if (metrics.auditResult) {
    const { critical, high, moderate, low } = metrics.auditResult.metadata.vulnerabilities;
    vulnerabilityPenalty = critical * 25 + high * 15 + moderate * 5 + low * 2;
  } else {
    // Fallback to simple count
    vulnerabilityPenalty = metrics.vulnerabilities * 10;
  }

  const score = 100 - deprecatedPenalty - vulnerabilityPenalty;
  return clamp(score);
}

/**
 * 複雑度スコアを計算
 */
function calculateComplexityScore(metrics: ProjectMetrics): number {
  // 依存関係の数に基づく複雑度
  // 0-20: 優秀, 21-50: 良好, 51-100: 普通, 101+: 複雑
  let score = 100;

  if (metrics.totalDependencies > 20) {
    score -= (metrics.totalDependencies - 20) * 0.5;
  }

  if (metrics.totalDependencies > 50) {
    score -= (metrics.totalDependencies - 50) * 0.3;
  }

  if (metrics.totalDependencies > 100) {
    score -= (metrics.totalDependencies - 100) * 0.2;
  }

  return clamp(score);
}

/**
 * メンテナンス性スコアを計算
 */
function calculateMaintainabilityScore(metrics: ProjectMetrics): number {
  if (metrics.totalDependencies === 0) {
    return 100;
  }

  // 古いパッケージと非推奨パッケージがメンテナンス性を下げる
  const outdatedRatio = metrics.outdatedCount / metrics.totalDependencies;
  const deprecatedRatio = metrics.deprecatedCount / metrics.totalDependencies;

  const outdatedPenalty = outdatedRatio * 40;
  const deprecatedPenalty = deprecatedRatio * 50;

  const score = 100 - outdatedPenalty - deprecatedPenalty;
  return clamp(score);
}

/**
 * パフォーマンススコアを計算
 */
function calculatePerformanceScore(metrics: ProjectMetrics): number {
  // Phase 1 では基本的な評価のみ
  // 依存関係が多いほどパフォーマンスリスクが高い
  let score = 100;

  if (metrics.totalDependencies > 50) {
    score -= (metrics.totalDependencies - 50) * 0.3;
  }

  return clamp(score);
}

/**
 * 総合健康スコアを計算
 */
export function calculateHealthScore(
  metrics: ProjectMetrics & { auditResult?: AuditResult },
  weights: ScoreWeights = DEFAULT_WEIGHTS
): HealthScore {
  const freshness = calculateFreshnessScore(metrics);
  const security = calculateSecurityScore(metrics);
  const complexity = calculateComplexityScore(metrics);
  const maintainability = calculateMaintainabilityScore(metrics);
  const performance = calculatePerformanceScore(metrics);

  // 重み付き平均で総合スコアを計算
  const overall = Math.round(
    freshness * weights.outdated +
    security * weights.security +
    complexity * weights.complexity +
    maintainability * weights.deprecated +
    performance * weights.duplicates
  );

  return {
    overall: clamp(overall),
    freshness: Math.round(freshness),
    security: Math.round(security),
    complexity: Math.round(complexity),
    maintainability: Math.round(maintainability),
    performance: Math.round(performance),
  };
}

/**
 * スコアに基づいて健康状態を評価
 */
export function getHealthStatus(score: number): {
  label: string;
  emoji: string;
  color: 'green' | 'yellow' | 'red';
} {
  if (score >= 80) {
    return { label: '健康', emoji: '🟢', color: 'green' };
  } else if (score >= 60) {
    return { label: '要注意', emoji: '🟡', color: 'yellow' };
  } else {
    return { label: '不健康', emoji: '🔴', color: 'red' };
  }
}
