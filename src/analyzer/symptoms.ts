import * as semver from 'semver';
import { Symptom, ProjectMetrics, Dependency } from '../types';

/**
 * ゾンビパッケージ（非推奨または長期間更新なし）を検出
 */
function detectZombiePackages(metrics: ProjectMetrics): Symptom | null {
  const zombiePackages = metrics.dependencies.filter(
    dep => dep.deprecated || dep.lastUpdateDays > 730 // 2年以上更新なし
  );

  if (zombiePackages.length === 0) {
    return null;
  }

  const severity = zombiePackages.length > 5 ? 'high' : 'medium';
  const affectedPackages = zombiePackages.map(
    p => `${p.name}@${p.version}${p.deprecated ? ' (deprecated)' : ''}`
  );

  return {
    id: 'zombie-packages',
    name: 'ゾンビパッケージ感染',
    severity,
    description: `${zombiePackages.length}個の非推奨または長期間更新されていないパッケージが検出されました`,
    affectedPackages,
    remedy: [
      '各パッケージの代替品を調査',
      '最新の推奨パッケージへの移行計画を立てる',
      'npm deprecate コマンドで詳細を確認',
    ],
    impact: 'セキュリティリスクとメンテナンス困難',
  };
}

/**
 * 大量の古いパッケージを検出
 */
function detectMassiveOutdated(metrics: ProjectMetrics): Symptom | null {
  const outdatedPackages = metrics.dependencies.filter(dep => {
    if (!semver.valid(dep.version) || !semver.valid(dep.latest)) {
      return false;
    }
    return semver.lt(dep.version, dep.latest);
  });

  if (outdatedPackages.length < 5) {
    return null;
  }

  const severity =
    outdatedPackages.length > metrics.totalDependencies * 0.5
      ? 'high'
      : 'medium';

  const majorUpdates = outdatedPackages.filter(dep => {
    const current = semver.parse(dep.version);
    const latest = semver.parse(dep.latest);
    return current && latest && current.major < latest.major;
  });

  const affectedPackages = outdatedPackages
    .slice(0, 10)
    .map(p => `${p.name}: ${p.version} → ${p.latest}`);

  return {
    id: 'massive-outdated',
    name: '更新遅延症候群',
    severity,
    description: `${outdatedPackages.length}個のパッケージが古いバージョンです（うち${majorUpdates.length}個はメジャーアップデート）`,
    affectedPackages,
    remedy: [
      'npm outdated で全体を確認',
      '段階的にアップデートを実施',
      'CHANGELOG を確認して破壊的変更をチェック',
      'テストを実行して動作確認',
    ],
    impact: 'セキュリティパッチの未適用、新機能の利用不可',
  };
}

/**
 * 依存関係の肥大化を検出
 */
function detectDependencyObesity(metrics: ProjectMetrics): Symptom | null {
  const threshold = 100;

  if (metrics.totalDependencies < threshold) {
    return null;
  }

  const severity = metrics.totalDependencies > 200 ? 'high' : 'medium';

  return {
    id: 'dependency-obesity',
    name: '依存関係肥大症',
    severity,
    description: `依存関係が${metrics.totalDependencies}個と多すぎます`,
    affectedPackages: [`総数: ${metrics.totalDependencies}個`],
    remedy: [
      '本当に必要な依存関係かレビュー',
      '使用されていないパッケージを削除',
      'depcheck ツールで未使用パッケージを検出',
      '類似機能のパッケージを統合',
    ],
    impact: 'ビルド時間の増加、セキュリティリスクの増大、メンテナンスコストの上昇',
  };
}

/**
 * バージョン不一致を検出（同じパッケージの異なるバージョン）
 */
function detectVersionConflicts(metrics: ProjectMetrics): Symptom | null {
  const packageNames = new Map<string, Dependency[]>();

  // パッケージ名でグループ化
  metrics.dependencies.forEach(dep => {
    const existing = packageNames.get(dep.name) || [];
    existing.push(dep);
    packageNames.set(dep.name, existing);
  });

  // 異なるバージョンを持つパッケージを検出
  const conflicts: string[] = [];
  packageNames.forEach((deps, name) => {
    if (deps.length > 1) {
      const versions = deps.map(d => `${d.type}:${d.version}`).join(', ');
      conflicts.push(`${name} (${versions})`);
    }
  });

  if (conflicts.length === 0) {
    return null;
  }

  return {
    id: 'version-conflicts',
    name: 'バージョン不一致症候群',
    severity: 'medium',
    description: `${conflicts.length}個のパッケージで異なるバージョンが指定されています`,
    affectedPackages: conflicts,
    remedy: [
      'package.json でバージョンを統一',
      'npm dedupe を実行',
      'package-lock.json を削除して再インストール',
    ],
    impact: 'ビルドエラーのリスク、予期しない動作',
  };
}

/**
 * プロジェクトの平均年齢が高すぎる
 */
function detectAncientDependencies(metrics: ProjectMetrics): Symptom | null {
  if (metrics.averageAge < 365) {
    return null;
  }

  const severity = metrics.averageAge > 730 ? 'high' : 'medium';
  const oldestPackages = metrics.dependencies
    .filter(d => d.lastUpdateDays > 365)
    .sort((a, b) => b.lastUpdateDays - a.lastUpdateDays)
    .slice(0, 5)
    .map(p => `${p.name} (${Math.round(p.lastUpdateDays / 365)}年前)`);

  return {
    id: 'ancient-dependencies',
    name: '老化症候群',
    severity,
    description: `依存関係の平均年齢が${Math.round(metrics.averageAge / 365)}年です`,
    affectedPackages: oldestPackages,
    remedy: [
      '定期的なアップデート計画の策定',
      '四半期ごとの依存関係レビュー',
      'Renovate や Dependabot の導入',
    ],
    impact: '技術的負債の蓄積、セキュリティリスク',
  };
}

/**
 * 症状を検出
 */
export function detectSymptoms(metrics: ProjectMetrics): Symptom[] {
  const symptoms: (Symptom | null)[] = [
    detectZombiePackages(metrics),
    detectMassiveOutdated(metrics),
    detectDependencyObesity(metrics),
    detectVersionConflicts(metrics),
    detectAncientDependencies(metrics),
  ];

  return symptoms
    .filter((s): s is Symptom => s !== null)
    .sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
}
