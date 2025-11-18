import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Vulnerability information from npm audit
 */
export interface Vulnerability {
  name: string;
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  title: string;
  url?: string;
  range?: string;
  fixAvailable?: boolean | { name: string; version: string };
}

/**
 * npm audit result
 */
export interface AuditResult {
  vulnerabilities: Vulnerability[];
  metadata: {
    vulnerabilities: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
      info: number;
      total: number;
    };
  };
}

/**
 * Run npm audit and get vulnerability information
 */
export async function runSecurityAudit(projectPath: string): Promise<AuditResult> {
  try {
    const { stdout } = await execAsync('npm audit --json', {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10, // 10MB
    });

    const auditData = JSON.parse(stdout);

    // Parse npm audit output (format varies by npm version)
    const vulnerabilities: Vulnerability[] = [];
    const metadata = {
      vulnerabilities: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
        total: 0,
      },
    };

    // npm v7+ format
    if (auditData.vulnerabilities) {
      Object.entries(auditData.vulnerabilities).forEach(([name, vulnData]: [string, any]) => {
        const vuln: Vulnerability = {
          name,
          severity: vulnData.severity,
          title: vulnData.via?.[0]?.title || 'Unknown vulnerability',
          url: vulnData.via?.[0]?.url,
          range: vulnData.range,
          fixAvailable: vulnData.fixAvailable,
        };
        vulnerabilities.push(vuln);

        // Count by severity
        const severity = vulnData.severity;
        if (severity && severity in metadata.vulnerabilities) {
          metadata.vulnerabilities[severity as keyof typeof metadata.vulnerabilities]++;
        }
      });
    }

    metadata.vulnerabilities.total = vulnerabilities.length;

    return {
      vulnerabilities,
      metadata,
    };
  } catch (error: any) {
    // npm audit exits with code 1 if vulnerabilities found
    if (error.stdout) {
      try {
        const auditData = JSON.parse(error.stdout);
        return parseAuditData(auditData);
      } catch {
        // Failed to parse, return empty result
      }
    }

    // Return empty result if audit fails
    return {
      vulnerabilities: [],
      metadata: {
        vulnerabilities: {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0,
          info: 0,
          total: 0,
        },
      },
    };
  }
}

/**
 * Parse npm audit data
 */
function parseAuditData(auditData: any): AuditResult {
  const vulnerabilities: Vulnerability[] = [];
  const metadata = {
    vulnerabilities: {
      critical: auditData.metadata?.vulnerabilities?.critical || 0,
      high: auditData.metadata?.vulnerabilities?.high || 0,
      moderate: auditData.metadata?.vulnerabilities?.moderate || 0,
      low: auditData.metadata?.vulnerabilities?.low || 0,
      info: auditData.metadata?.vulnerabilities?.info || 0,
      total: auditData.metadata?.vulnerabilities?.total || 0,
    },
  };

  // npm v7+ format
  if (auditData.vulnerabilities) {
    Object.entries(auditData.vulnerabilities).forEach(([name, vulnData]: [string, any]) => {
      const vuln: Vulnerability = {
        name,
        severity: vulnData.severity || 'info',
        title: vulnData.via?.[0]?.title || 'Unknown vulnerability',
        url: vulnData.via?.[0]?.url,
        range: vulnData.range,
        fixAvailable: vulnData.fixAvailable,
      };
      vulnerabilities.push(vuln);
    });
  }

  return {
    vulnerabilities,
    metadata,
  };
}

/**
 * Calculate security score based on vulnerabilities
 */
export function calculateSecurityScore(audit: AuditResult): number {
  const { critical, high, moderate, low } = audit.metadata.vulnerabilities;

  // Penalty weights
  const criticalPenalty = critical * 25;
  const highPenalty = high * 15;
  const moderatePenalty = moderate * 5;
  const lowPenalty = low * 2;

  const totalPenalty = criticalPenalty + highPenalty + moderatePenalty + lowPenalty;
  const score = Math.max(0, Math.min(100, 100 - totalPenalty));

  return Math.round(score);
}
