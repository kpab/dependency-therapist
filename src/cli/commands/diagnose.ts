import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { diagnose } from '../../index';
import { generateReport, generateSimpleSummary } from '../../utils/reporter';

export function createDiagnoseCommand(): Command {
  const command = new Command('diagnose');

  command
    .description('プロジェクトの依存関係を診断します')
    .option('-p, --path <path>', 'プロジェクトのパス', process.cwd())
    .option('-s, --simple', 'シンプルなサマリーのみ表示', false)
    .option('--json', 'JSON形式で出力', false)
    .action(async (options) => {
      const spinner = ora('依存関係を診断中...').start();

      try {
        const result = await diagnose(options.path);
        spinner.succeed('診断が完了しました');

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else if (options.simple) {
          console.log(generateSimpleSummary(result));
        } else {
          console.log(generateReport(result));
        }

        // 健康スコアが低い場合は終了コード1を返す
        if (result.score.overall < 60) {
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('診断に失敗しました');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  return command;
}
