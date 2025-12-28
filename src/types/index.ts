/**
 * 依存関係の健康スコア
 */
export interface HealthScore {
  overall: number;          // 総合スコア (0-100)
  freshness: number;        // パッケージの鮮度
  security: number;         // セキュリティ脆弱性
  complexity: number;       // 依存関係の複雑度
  maintainability: number;  // メンテナンス性
  performance: number;      // パフォーマンス影響
}

/**
 * 依存関係情報
 */
export interface Dependency {
  name: string;
  version: string;
  latest: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  deprecated: boolean;
  lastUpdateDays: number;
  vulnerabilities: number;
  size?: number;
}

/**
 * プロジェクトメトリクス
 */
export interface ProjectMetrics {
  totalDependencies: number;
  outdatedCount: number;
  deprecatedCount: number;
  vulnerabilities: number;
  duplicates: number;
  averageAge: number;
  dependencies: Dependency[];
  duplicatesList?: Duplicate[];
}

/**
 * 症状の重症度
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/**
 * 症状情報
 */
export interface Symptom {
  id: string;
  name: string;
  severity: Severity;
  description: string;
  affectedPackages: string[];
  remedy: string[];
  impact: string;
}

/**
 * 診断結果
 */
export interface DiagnosisResult {
  score: HealthScore;
  metrics: ProjectMetrics;
  symptoms: Symptom[];
  timestamp: Date;
  projectPath: string;
}

/**
 * スコア重み付け設定
 */
export interface ScoreWeights {
  outdated: number;
  deprecated: number;
  security: number;
  complexity: number;
  duplicates: number;
}

/**
 * 重複パッケージのインスタンス情報
 */
export interface DuplicateInstance {
  version: string;
  path: string;
}

/**
 * 重複パッケージ情報
 */
export interface Duplicate {
  name: string;
  versions: string[];
  count: number;
  instances: DuplicateInstance[];
}
