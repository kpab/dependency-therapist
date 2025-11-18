import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Auto-fix result
 */
export interface AutoFixResult {
  success: boolean;
  fixed: string[];
  failed: string[];
  skipped: string[];
  output: string;
}

/**
 * Backup package.json and package-lock.json
 */
async function backupPackageFiles(projectPath: string): Promise<void> {
  const packageJson = path.join(projectPath, 'package.json');
  const packageLock = path.join(projectPath, 'package-lock.json');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (fs.existsSync(packageJson)) {
    fs.copyFileSync(packageJson, `${packageJson}.backup-${timestamp}`);
  }

  if (fs.existsSync(packageLock)) {
    fs.copyFileSync(packageLock, `${packageLock}.backup-${timestamp}`);
  }
}

/**
 * Run npm audit fix
 */
export async function runAuditFix(
  projectPath: string,
  options: { force?: boolean; dryRun?: boolean } = {}
): Promise<AutoFixResult> {
  const result: AutoFixResult = {
    success: false,
    fixed: [],
    failed: [],
    skipped: [],
    output: '',
  };

  try {
    // Backup package files before fix
    if (!options.dryRun) {
      await backupPackageFiles(projectPath);
    }

    // Build command
    const cmd = options.dryRun
      ? 'npm audit fix --dry-run --json'
      : options.force
      ? 'npm audit fix --force --json'
      : 'npm audit fix --json';

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10,
    });

    result.output = stdout || stderr;

    try {
      const auditData = JSON.parse(stdout);

      // Parse fix results
      if (auditData.audit) {
        const fixedCount = auditData.audit.metadata?.vulnerabilities?.total || 0;
        result.success = true;
        result.fixed.push(`Fixed ${fixedCount} vulnerabilities`);
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract info from text output
      result.success = !result.output.includes('npm ERR!');
      result.fixed.push('Audit fix completed');
    }

    return result;
  } catch (error: any) {
    // npm audit fix exits with code 1 if there are unfixed vulnerabilities
    if (error.stdout) {
      result.output = error.stdout;

      try {
        const auditData = JSON.parse(error.stdout);
        result.success = true;

        if (auditData.audit) {
          result.fixed.push('Some vulnerabilities were fixed');
          result.failed.push('Some vulnerabilities require manual intervention');
        }
      } catch {
        result.failed.push('Failed to parse audit fix results');
      }
    } else {
      result.failed.push(error.message || 'Unknown error occurred');
    }

    return result;
  }
}

/**
 * Update outdated dependencies (patch and minor only, safe updates)
 */
export async function runSafeUpdate(
  projectPath: string,
  options: { dryRun?: boolean } = {}
): Promise<AutoFixResult> {
  const result: AutoFixResult = {
    success: false,
    fixed: [],
    failed: [],
    skipped: [],
    output: '',
  };

  try {
    // Backup package files before update
    if (!options.dryRun) {
      await backupPackageFiles(projectPath);
    }

    // Run npm update (updates to latest within semver range)
    const cmd = options.dryRun ? 'npm outdated --json' : 'npm update';

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10,
    });

    result.output = stdout || stderr;
    result.success = true;

    if (options.dryRun) {
      try {
        const outdated = JSON.parse(stdout);
        const packages = Object.keys(outdated);
        result.skipped = packages.map(pkg => `${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`);
      } catch {
        result.skipped.push('No outdated packages found');
      }
    } else {
      result.fixed.push('Updated dependencies to latest safe versions');
    }

    return result;
  } catch (error: any) {
    if (options.dryRun && error.stdout) {
      // npm outdated exits with code 1 if there are outdated packages
      try {
        const outdated = JSON.parse(error.stdout);
        const packages = Object.keys(outdated);
        result.success = true;
        result.skipped = packages.map(pkg => `${pkg}: ${outdated[pkg].current} → ${outdated[pkg].latest}`);
      } catch {
        result.failed.push('Failed to check outdated packages');
      }
    } else {
      result.failed.push(error.message || 'Update failed');
    }

    return result;
  }
}

/**
 * Run all auto-fix operations
 */
export async function runAutoFix(
  projectPath: string,
  options: { force?: boolean; dryRun?: boolean; skipAudit?: boolean; skipUpdate?: boolean } = {}
): Promise<{ audit: AutoFixResult; update: AutoFixResult }> {
  const results = {
    audit: {
      success: false,
      fixed: [],
      failed: [],
      skipped: [],
      output: '',
    } as AutoFixResult,
    update: {
      success: false,
      fixed: [],
      failed: [],
      skipped: [],
      output: '',
    } as AutoFixResult,
  };

  // Run audit fix
  if (!options.skipAudit) {
    results.audit = await runAuditFix(projectPath, {
      force: options.force,
      dryRun: options.dryRun,
    });
  } else {
    results.audit.skipped.push('Audit fix skipped');
  }

  // Run safe update
  if (!options.skipUpdate) {
    results.update = await runSafeUpdate(projectPath, {
      dryRun: options.dryRun,
    });
  } else {
    results.update.skipped.push('Update skipped');
  }

  return results;
}
