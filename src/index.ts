import { scanDependencies } from './analyzer/scanner';
import { calculateHealthScore } from './analyzer/scorer';
import { detectSymptoms } from './analyzer/symptoms';
import { DiagnosisResult } from './types';

/**
 * プロジェクトの依存関係を診断
 */
export async function diagnose(projectPath: string = process.cwd()): Promise<DiagnosisResult> {
  // 依存関係をスキャン
  const metrics = await scanDependencies(projectPath);

  // 健康スコアを計算
  const score = calculateHealthScore(metrics);

  // 症状を検出
  const symptoms = detectSymptoms(metrics);

  return {
    score,
    metrics,
    symptoms,
    timestamp: new Date(),
    projectPath,
  };
}

// 型をエクスポート
export * from './types';
export { calculateHealthScore, getHealthStatus } from './analyzer/scorer';
export { scanDependencies } from './analyzer/scanner';
export { detectSymptoms } from './analyzer/symptoms';
export { generateReport, generateSimpleSummary } from './utils/reporter';
export { setLocale, getLocale, t } from './i18n';
export type { Locale, TranslationKey } from './i18n';
