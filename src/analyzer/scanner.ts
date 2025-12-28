import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import pacote from 'pacote';
import { Dependency, Duplicate, ProjectMetrics } from '../types';
import { runSecurityAudit, AuditResult } from './security';
import { scanDuplicates } from './duplicates';

/**
 * package.json を読み込む
 */
export async function loadPackageJson(projectPath: string): Promise<any> {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json が見つかりません');
  }

  const content = fs.readFileSync(packageJsonPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * npm レジストリから最新パッケージ情報を取得
 */
export async function fetchPackageInfo(name: string): Promise<any> {
  try {
    const manifest = await pacote.manifest(name);
    return manifest;
  } catch (error) {
    console.warn(`警告: ${name} の情報を取得できませんでした`);
    return null;
  }
}

/**
 * パッケージが非推奨かどうかチェック
 */
function isDeprecated(manifest: any): boolean {
  return manifest?.deprecated !== undefined;
}

/**
 * 最終更新からの経過日数を計算
 */
function calculateDaysSinceUpdate(manifest: any): number {
  if (!manifest?.time?.modified) {
    return 0;
  }

  const lastModified = new Date(manifest.time.modified);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastModified.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 依存関係をスキャンして情報を収集
 */
export async function scanDependencies(
  projectPath: string,
  options: { skipAudit?: boolean } = {}
): Promise<ProjectMetrics & { auditResult?: AuditResult }> {
  const packageJson = await loadPackageJson(projectPath);

  const dependencies: Dependency[] = [];
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'] as const;

  for (const depType of depTypes) {
    const deps = packageJson[depType] || {};

    for (const [name, version] of Object.entries(deps)) {
      const manifest = await fetchPackageInfo(name);

      if (!manifest) {
        continue;
      }

      const currentVersion = (version as string).replace(/^[\^~]/, '');
      const latestVersion = manifest.version || currentVersion;

      const dep: Dependency = {
        name,
        version: currentVersion,
        latest: latestVersion,
        type: depType,
        deprecated: isDeprecated(manifest),
        lastUpdateDays: calculateDaysSinceUpdate(manifest),
        vulnerabilities: 0,
      };

      dependencies.push(dep);
    }
  }

  // Run security audit
  let auditResult: AuditResult | undefined;
  let totalVulnerabilities = 0;

  if (!options.skipAudit) {
    try {
      auditResult = await runSecurityAudit(projectPath);
      totalVulnerabilities = auditResult.metadata.vulnerabilities.total;

      // Map vulnerabilities to dependencies
      auditResult.vulnerabilities.forEach(vuln => {
        const dep = dependencies.find(d => d.name === vuln.name);
        if (dep) {
          dep.vulnerabilities++;
        }
      });
    } catch (error) {
      // Audit failed, continue without it
      console.warn('Security audit failed, continuing without vulnerability data');
    }
  }

  // Scan for duplicate packages
  let duplicatesList: Duplicate[] = [];
  try {
    duplicatesList = await scanDuplicates(projectPath);
  } catch (error) {
    console.warn('Duplicate scan failed, continuing without duplicate data');
  }

  // Calculate metrics
  const outdatedCount = dependencies.filter(
    d => semver.valid(d.version) && semver.valid(d.latest) && semver.lt(d.version, d.latest)
  ).length;

  const deprecatedCount = dependencies.filter(d => d.deprecated).length;

  const averageAge = dependencies.length > 0
    ? dependencies.reduce((sum, d) => sum + d.lastUpdateDays, 0) / dependencies.length
    : 0;

  return {
    totalDependencies: dependencies.length,
    outdatedCount,
    deprecatedCount,
    vulnerabilities: totalVulnerabilities,
    duplicates: duplicatesList.length,
    averageAge: Math.round(averageAge),
    dependencies,
    duplicatesList,
    auditResult,
  };
}
