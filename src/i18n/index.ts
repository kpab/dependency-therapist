export type Locale = 'en' | 'ja';

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

// Translation keys
export const translations = {
  en: {
    // General
    healthy: 'Healthy',
    needsAttention: 'Needs Attention',
    unhealthy: 'Unhealthy',

    // Report
    projectHealthReport: 'Project Health Diagnosis Report',
    overallHealthScore: 'Overall Health Score',
    detailedScores: 'Detailed Scores',
    freshness: 'Freshness',
    security: 'Security',
    complexity: 'Complexity',
    maintainability: 'Maintainability',
    performance: 'Performance',

    // Summary
    summary: 'Summary',
    totalDependencies: 'Total Dependencies',
    outdatedPackages: 'Outdated Packages',
    deprecatedPackages: 'Deprecated Packages',
    averageAge: 'Average Age',
    months: 'months',
    detectedSymptoms: 'Detected Symptoms',

    // Symptoms
    symptomsDetected: 'Detected Symptoms',
    noSymptomsDetected: 'No symptoms detected. Your project is healthy!',
    severity: 'Severity',
    symptom: 'Symptom',
    description: 'Description',
    affectedPackages: 'Affected Packages',
    prescription: 'Prescription',
    impact: 'Impact',
    andMore: 'and {count} more',

    // Symptom Names
    'symptom.duplicate-packages': 'Clone Infection',
    'symptom.zombie-packages': 'Zombie Package Infection',
    'symptom.massive-outdated': 'Update Delay Syndrome',
    'symptom.dependency-obesity': 'Dependency Obesity',
    'symptom.version-conflicts': 'Version Conflict Syndrome',
    'symptom.ancient-dependencies': 'Aging Syndrome',
    'symptom.security-vulnerabilities': 'Security Vulnerability Infection',

    // Symptom Descriptions
    'symptom.duplicate-packages.desc': '{count} packages are duplicated with multiple versions installed',
    'symptom.zombie-packages.desc': '{count} deprecated or long-unmaintained packages detected',
    'symptom.massive-outdated.desc': '{count} packages are outdated ({major} major updates)',
    'symptom.dependency-obesity.desc': 'Too many dependencies: {count}',
    'symptom.version-conflicts.desc': '{count} packages have different versions specified',
    'symptom.ancient-dependencies.desc': 'Average dependency age is {years} years',
    'symptom.security-vulnerabilities.desc': '{total} security vulnerabilities detected ({breakdown})',

    // Symptom Remedies
    'remedy.dedupe': 'Run npm dedupe to optimize installation',
    'remedy.unify-versions': 'Unify different versions of the same package',
    'remedy.regenerate-lock': 'Delete package-lock.json and run npm install to regenerate',
    'remedy.find-alternatives': 'Research alternatives for each package',
    'remedy.plan-migration': 'Plan migration to latest recommended packages',
    'remedy.check-deprecate': 'Check details with npm deprecate command',
    'remedy.check-outdated': 'Check all with npm outdated',
    'remedy.gradual-update': 'Implement gradual updates',
    'remedy.check-changelog': 'Check CHANGELOG for breaking changes',
    'remedy.run-tests': 'Run tests to verify functionality',
    'remedy.review-deps': 'Review if dependencies are really necessary',
    'remedy.remove-unused': 'Remove unused packages',
    'remedy.use-depcheck': 'Use depcheck tool to detect unused packages',
    'remedy.consolidate': 'Consolidate packages with similar functionality',
    'remedy.unify-packagejson': 'Unify versions in package.json',
    'remedy.schedule-updates': 'Establish regular update schedule',
    'remedy.quarterly-review': 'Quarterly dependency review',
    'remedy.use-renovate': 'Introduce Renovate or Dependabot',
    'remedy.audit-fix': 'Try automatic fix with npm audit fix',
    'remedy.manual-update': 'Manually update critical vulnerabilities',
    'remedy.audit-report': 'Check details with npm audit report',
    'remedy.consider-alternatives': 'Consider alternative packages if unfixable',

    // Symptom Impacts
    'impact.duplicate': 'Increased bundle size, memory usage, and installation time',
    'impact.zombie': 'Security risks and maintenance difficulties',
    'impact.outdated': 'Missing security patches, unable to use new features',
    'impact.obesity': 'Increased build time, security risks, and maintenance costs',
    'impact.conflicts': 'Risk of build errors, unexpected behavior',
    'impact.ancient': 'Technical debt accumulation, security risks',
    'impact.security': 'Risk of security breach, potential data leakage',

    // Recommendations
    recommendations: 'Recommended Actions',
    noRecommendations: 'No recommendations. Your project is healthy!',
    priorityHigh: 'Priority HIGH',
    priorityMedium: 'Priority MEDIUM',
    nextSteps: 'Next Steps',
    scheduleReview: 'Schedule regular dependency reviews',
    introduceAutomation: 'Consider introducing Renovate or Dependabot',
    integrateCICD: 'Integrate dependency-therapist into CI/CD',
    updateDeps: 'Update dependencies with npm update',
    investigateAlternatives: 'Investigate alternatives for deprecated packages',
    runAudit: 'Run npm audit for security check',
    runAuditFix: 'Try npm audit fix for automatic repair',
    useDepcheck: 'Detect unused packages with depcheck',
    removeUnused: 'Remove unnecessary dependencies',

    // Charts
    healthScoreVisualization: 'Health Score Visualization',
    overallScore: 'Overall Score',
    details: 'Details',
    packageAgeDistribution: 'Package Age Distribution',
    severityBreakdown: 'Severity Breakdown',
    dependencyStatus: 'Dependency Status',
    upToDate: 'Up to date',
    outdated: 'Outdated',
    deprecated: 'Deprecated',
    duplicatePackages: 'Duplicate packages',
    interactiveVisualization: 'Interactive Visualization',

    // Age groups
    'age.0-3months': '0-3 months',
    'age.3-6months': '3-6 months',
    'age.6-12months': '6-12 months',
    'age.1year+': '1+ years',
    'age.yearsAgo': '{years} years ago',

    // HTML Report
    healthDiagnosisReport: 'Health Diagnosis Report',
    projectMetrics: 'Project Metrics',
    vulnerabilities: 'Vulnerabilities',
    generatedAt: 'Generated',
    project: 'Project',
    yourProjectPhysician: 'Your project\'s physician',

    // CLI
    diagnosing: 'Diagnosing dependencies...',
    diagnosisCompleted: 'Diagnosis completed',
    diagnosisFailed: 'Diagnosis failed',
    htmlReportGenerated: 'HTML report generated',
    diagnosisDate: 'Diagnosis Date',
    projectPath: 'Project Path',

    // CLI Welcome
    welcomeMessage: 'Welcome to Dependency Therapist!',
    cliDescription: 'AI-powered dependency health diagnostics for Node.js projects',
    usage: 'Usage',
    moreInfo: 'More info',
    diagnoseDesc: 'Diagnose your project',
    diagnoseHtmlDesc: 'Generate HTML report',
    autoFixDesc: 'Auto-fix issues',
    previewFixesDesc: 'Preview fixes',

    // Heal Command
    autoHealTitle: 'Dependency Therapist - Auto Heal',
    healConfirmMessage: 'This will modify your package files. Backups will be created. Continue?',
    healCancelled: 'Healing cancelled.',
    dryRunMode: 'Dry run mode - no changes will be made',
    analyzingAndFixing: 'Analyzing and fixing issues...',
    healingCompleted: 'Healing process completed',
    healingFailed: 'Healing failed',
    securityAuditFix: 'Security Audit Fix',
    dependencyUpdates: 'Dependency Updates',
    wouldUpdate: 'Would update',
    andMoreItems: 'and {count} more',
    nextStepsTitle: 'Next Steps',
    reviewChanges: 'Review the changes above',
    runWithoutDryRun: 'Run without --dry-run to apply fixes',
    runDiagnoseAgain: 'Run diagnose again to verify improvements',
    testApplication: 'Test your application thoroughly',
    commitChanges: 'Commit the changes if everything works',
  },

  ja: {
    // General
    healthy: '健康',
    needsAttention: '要注意',
    unhealthy: '不健康',

    // Report
    projectHealthReport: 'プロジェクト健康診断レポート',
    overallHealthScore: '総合健康スコア',
    detailedScores: '詳細スコア',
    freshness: '鮮度',
    security: 'セキュリティ',
    complexity: '複雑度',
    maintainability: 'メンテナンス性',
    performance: 'パフォーマンス',

    // Summary
    summary: 'サマリー',
    totalDependencies: '総依存関係数',
    outdatedPackages: '古いパッケージ',
    deprecatedPackages: '非推奨パッケージ',
    averageAge: '平均年齢',
    months: 'ヶ月',
    detectedSymptoms: '検出された症状',

    // Symptoms
    symptomsDetected: '検出された症状',
    noSymptomsDetected: '症状は検出されませんでした。プロジェクトは健康です！',
    severity: '重症度',
    symptom: '症状',
    description: '説明',
    affectedPackages: '影響パッケージ',
    prescription: '処方箋',
    impact: '影響',
    andMore: '他{count}件',

    // Symptom Names
    'symptom.duplicate-packages': 'クローン感染',
    'symptom.zombie-packages': 'ゾンビパッケージ感染',
    'symptom.massive-outdated': '更新遅延症候群',
    'symptom.dependency-obesity': '依存関係肥大症',
    'symptom.version-conflicts': 'バージョン不一致症候群',
    'symptom.ancient-dependencies': '老化症候群',
    'symptom.security-vulnerabilities': 'セキュリティ脆弱性感染',

    // Symptom Descriptions
    'symptom.duplicate-packages.desc': '{count}個のパッケージが重複して複数バージョンインストールされています',
    'symptom.zombie-packages.desc': '{count}個の非推奨または長期間更新されていないパッケージが検出されました',
    'symptom.massive-outdated.desc': '{count}個のパッケージが古いバージョンです（うち{major}個はメジャーアップデート）',
    'symptom.dependency-obesity.desc': '依存関係が{count}個と多すぎます',
    'symptom.version-conflicts.desc': '{count}個のパッケージで異なるバージョンが指定されています',
    'symptom.ancient-dependencies.desc': '依存関係の平均年齢が{years}年です',
    'symptom.security-vulnerabilities.desc': '{total}個のセキュリティ脆弱性が検出されました ({breakdown})',

    // Symptom Remedies
    'remedy.dedupe': 'npm dedupe を実行してインストールを最適化',
    'remedy.unify-versions': '同じパッケージの異なるバージョンを統一',
    'remedy.regenerate-lock': 'package-lock.json を削除して npm install で再生成',
    'remedy.find-alternatives': '各パッケージの代替品を調査',
    'remedy.plan-migration': '最新の推奨パッケージへの移行計画を立てる',
    'remedy.check-deprecate': 'npm deprecate コマンドで詳細を確認',
    'remedy.check-outdated': 'npm outdated で全体を確認',
    'remedy.gradual-update': '段階的にアップデートを実施',
    'remedy.check-changelog': 'CHANGELOG を確認して破壊的変更をチェック',
    'remedy.run-tests': 'テストを実行して動作確認',
    'remedy.review-deps': '本当に必要な依存関係かレビュー',
    'remedy.remove-unused': '使用されていないパッケージを削除',
    'remedy.use-depcheck': 'depcheck ツールで未使用パッケージを検出',
    'remedy.consolidate': '類似機能のパッケージを統合',
    'remedy.unify-packagejson': 'package.json でバージョンを統一',
    'remedy.schedule-updates': '定期的なアップデート計画の策定',
    'remedy.quarterly-review': '四半期ごとの依存関係レビュー',
    'remedy.use-renovate': 'Renovate や Dependabot の導入',
    'remedy.audit-fix': 'npm audit fix で自動修復を試行',
    'remedy.manual-update': '重大な脆弱性は手動でアップデート',
    'remedy.audit-report': 'npm audit report で詳細を確認',
    'remedy.consider-alternatives': '修正できない場合は代替パッケージを検討',

    // Symptom Impacts
    'impact.duplicate': 'バンドルサイズの増大、メモリ使用量増加、インストール時間延長',
    'impact.zombie': 'セキュリティリスクとメンテナンス困難',
    'impact.outdated': 'セキュリティパッチの未適用、新機能の利用不可',
    'impact.obesity': 'ビルド時間の増加、セキュリティリスクの増大、メンテナンスコストの上昇',
    'impact.conflicts': 'ビルドエラーのリスク、予期しない動作',
    'impact.ancient': '技術的負債の蓄積、セキュリティリスク',
    'impact.security': 'セキュリティ侵害のリスク、データ漏洩の可能性',

    // Recommendations
    recommendations: '推奨アクション',
    noRecommendations: '推奨アクション: なし。プロジェクトは健康な状態です！',
    priorityHigh: '優先度 HIGH',
    priorityMedium: '優先度 MEDIUM',
    nextSteps: '次のステップ',
    scheduleReview: '定期的な依存関係レビューをスケジュール',
    introduceAutomation: 'Renovate や Dependabot の導入を検討',
    integrateCICD: 'CI/CD に dependency-therapist を統合',
    updateDeps: 'npm update で依存関係を更新',
    investigateAlternatives: '非推奨パッケージの代替品を調査',
    runAudit: 'npm audit でセキュリティチェック',
    runAuditFix: 'npm audit fix で自動修復を試行',
    useDepcheck: 'depcheck で未使用パッケージを検出',
    removeUnused: '不要な依存関係を削除',

    // Charts
    healthScoreVisualization: 'ヘルススコア可視化',
    overallScore: '総合スコア',
    details: '詳細',
    packageAgeDistribution: 'パッケージ年齢分布',
    severityBreakdown: '症状の重症度内訳',
    dependencyStatus: '依存関係の状態',
    upToDate: '最新',
    outdated: '古い',
    deprecated: '非推奨',
    duplicatePackages: '重複パッケージ',
    interactiveVisualization: 'インタラクティブ可視化',

    // Age groups
    'age.0-3months': '0-3ヶ月',
    'age.3-6months': '3-6ヶ月',
    'age.6-12months': '6-12ヶ月',
    'age.1year+': '1年以上',
    'age.yearsAgo': '{years}年前',

    // HTML Report
    healthDiagnosisReport: '健康診断レポート',
    projectMetrics: 'プロジェクトメトリクス',
    vulnerabilities: '脆弱性',
    generatedAt: '生成日時',
    project: 'プロジェクト',
    yourProjectPhysician: 'プロジェクトの主治医',

    // CLI
    diagnosing: '依存関係を診断中...',
    diagnosisCompleted: '診断完了',
    diagnosisFailed: '診断に失敗しました',
    htmlReportGenerated: 'HTMLレポートを生成しました',
    diagnosisDate: '診断日時',
    projectPath: 'プロジェクトパス',

    // CLI Welcome
    welcomeMessage: 'Dependency Therapist へようこそ！',
    cliDescription: 'Node.js プロジェクトの依存関係健康診断ツール',
    usage: '使い方',
    moreInfo: '詳細情報',
    diagnoseDesc: 'プロジェクトを診断',
    diagnoseHtmlDesc: 'HTMLレポートを生成',
    autoFixDesc: '問題を自動修復',
    previewFixesDesc: '修復のプレビュー',

    // Heal Command
    autoHealTitle: 'Dependency Therapist - 自動修復',
    healConfirmMessage: 'パッケージファイルを変更します。バックアップが作成されます。続行しますか？',
    healCancelled: '修復がキャンセルされました。',
    dryRunMode: 'ドライランモード - 変更は行われません',
    analyzingAndFixing: '分析と修復を実行中...',
    healingCompleted: '修復プロセス完了',
    healingFailed: '修復に失敗しました',
    securityAuditFix: 'セキュリティ監査修復',
    dependencyUpdates: '依存関係の更新',
    wouldUpdate: '更新対象',
    andMoreItems: '他{count}件',
    nextStepsTitle: '次のステップ',
    reviewChanges: '上記の変更内容を確認してください',
    runWithoutDryRun: '--dry-run なしで実行して修復を適用',
    runDiagnoseAgain: 'diagnose を再実行して改善を確認',
    testApplication: 'アプリケーションを十分にテスト',
    commitChanges: '問題なければ変更をコミット',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = currentLocale;
  let text: string = translations[locale][key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}
