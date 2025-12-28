import * as semver from 'semver';
import { Symptom, ProjectMetrics, Dependency, Duplicate } from '../types';
import { AuditResult } from './security';
import { t } from '../i18n';

/**
 * Detect duplicate packages
 */
function detectDuplicatePackages(
  metrics: ProjectMetrics & { duplicatesList?: Duplicate[] }
): Symptom | null {
  const duplicatesList = metrics.duplicatesList || [];

  if (duplicatesList.length === 0) {
    return null;
  }

  const totalDuplicateInstances = duplicatesList.reduce(
    (sum, dup) => sum + (dup.count - 1),
    0
  );

  const severity =
    duplicatesList.length > 5 || totalDuplicateInstances > 20
      ? 'high'
      : 'medium';

  const affectedPackages = duplicatesList
    .slice(0, 10)
    .map(dup => `${dup.name} (${dup.count}x: ${dup.versions.join(', ')})`);

  return {
    id: 'duplicate-packages',
    name: t('symptom.duplicate-packages'),
    severity,
    description: t('symptom.duplicate-packages.desc', { count: duplicatesList.length }),
    affectedPackages,
    remedy: [
      t('remedy.dedupe'),
      t('remedy.unify-versions'),
      t('remedy.regenerate-lock'),
    ],
    impact: t('impact.duplicate'),
  };
}

/**
 * Detect zombie packages (deprecated or not updated for a long time)
 */
function detectZombiePackages(metrics: ProjectMetrics): Symptom | null {
  const zombiePackages = metrics.dependencies.filter(
    dep => dep.deprecated || dep.lastUpdateDays > 730 // No update for 2+ years
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
    name: t('symptom.zombie-packages'),
    severity,
    description: t('symptom.zombie-packages.desc', { count: zombiePackages.length }),
    affectedPackages,
    remedy: [
      t('remedy.find-alternatives'),
      t('remedy.plan-migration'),
      t('remedy.check-deprecate'),
    ],
    impact: t('impact.zombie'),
  };
}

/**
 * Detect massive outdated packages
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
    name: t('symptom.massive-outdated'),
    severity,
    description: t('symptom.massive-outdated.desc', {
      count: outdatedPackages.length,
      major: majorUpdates.length,
    }),
    affectedPackages,
    remedy: [
      t('remedy.check-outdated'),
      t('remedy.gradual-update'),
      t('remedy.check-changelog'),
      t('remedy.run-tests'),
    ],
    impact: t('impact.outdated'),
  };
}

/**
 * Detect dependency obesity
 */
function detectDependencyObesity(metrics: ProjectMetrics): Symptom | null {
  const threshold = 100;

  if (metrics.totalDependencies < threshold) {
    return null;
  }

  const severity = metrics.totalDependencies > 200 ? 'high' : 'medium';

  return {
    id: 'dependency-obesity',
    name: t('symptom.dependency-obesity'),
    severity,
    description: t('symptom.dependency-obesity.desc', { count: metrics.totalDependencies }),
    affectedPackages: [`${t('totalDependencies')}: ${metrics.totalDependencies}`],
    remedy: [
      t('remedy.review-deps'),
      t('remedy.remove-unused'),
      t('remedy.use-depcheck'),
      t('remedy.consolidate'),
    ],
    impact: t('impact.obesity'),
  };
}

/**
 * Detect version conflicts (different versions of the same package)
 */
function detectVersionConflicts(metrics: ProjectMetrics): Symptom | null {
  const packageNames = new Map<string, Dependency[]>();

  // Group by package name
  metrics.dependencies.forEach(dep => {
    const existing = packageNames.get(dep.name) || [];
    existing.push(dep);
    packageNames.set(dep.name, existing);
  });

  // Detect packages with different versions
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
    name: t('symptom.version-conflicts'),
    severity: 'medium',
    description: t('symptom.version-conflicts.desc', { count: conflicts.length }),
    affectedPackages: conflicts,
    remedy: [
      t('remedy.unify-packagejson'),
      t('remedy.dedupe'),
      t('remedy.regenerate-lock'),
    ],
    impact: t('impact.conflicts'),
  };
}

/**
 * Detect ancient dependencies (average age too high)
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
    .map(p => `${p.name} (${t('age.yearsAgo', { years: Math.round(p.lastUpdateDays / 365) })})`);

  return {
    id: 'ancient-dependencies',
    name: t('symptom.ancient-dependencies'),
    severity,
    description: t('symptom.ancient-dependencies.desc', { years: Math.round(metrics.averageAge / 365) }),
    affectedPackages: oldestPackages,
    remedy: [
      t('remedy.schedule-updates'),
      t('remedy.quarterly-review'),
      t('remedy.use-renovate'),
    ],
    impact: t('impact.ancient'),
  };
}

/**
 * Detect security vulnerabilities
 */
function detectSecurityVulnerabilities(
  metrics: ProjectMetrics & { auditResult?: AuditResult }
): Symptom | null {
  if (!metrics.auditResult || metrics.auditResult.metadata.vulnerabilities.total === 0) {
    return null;
  }

  const { critical, high, moderate, low, total } = metrics.auditResult.metadata.vulnerabilities;

  let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (critical > 0) {
    severity = 'critical';
  } else if (high > 0) {
    severity = 'high';
  } else if (moderate > 0) {
    severity = 'medium';
  }

  const affectedPackages = metrics.auditResult.vulnerabilities
    .slice(0, 10)
    .map(v => `${v.name} (${v.severity}: ${v.title})`);

  const severityBreakdown = [];
  if (critical > 0) severityBreakdown.push(`Critical: ${critical}`);
  if (high > 0) severityBreakdown.push(`High: ${high}`);
  if (moderate > 0) severityBreakdown.push(`Moderate: ${moderate}`);
  if (low > 0) severityBreakdown.push(`Low: ${low}`);

  return {
    id: 'security-vulnerabilities',
    name: t('symptom.security-vulnerabilities'),
    severity,
    description: t('symptom.security-vulnerabilities.desc', {
      total,
      breakdown: severityBreakdown.join(', '),
    }),
    affectedPackages,
    remedy: [
      t('remedy.audit-fix'),
      t('remedy.manual-update'),
      t('remedy.audit-report'),
      t('remedy.consider-alternatives'),
    ],
    impact: t('impact.security'),
  };
}

/**
 * Detect symptoms
 */
export function detectSymptoms(
  metrics: ProjectMetrics & { auditResult?: AuditResult; duplicatesList?: Duplicate[] }
): Symptom[] {
  const symptoms: (Symptom | null)[] = [
    detectSecurityVulnerabilities(metrics),
    detectDuplicatePackages(metrics),
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
