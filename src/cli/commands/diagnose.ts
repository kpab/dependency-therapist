import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import { diagnose } from '../../index';
import { generateReport, generateSimpleSummary } from '../../utils/reporter';
import { generateHTMLReport } from '../../visualizer/html-report';

export function createDiagnoseCommand(): Command {
  const command = new Command('diagnose');

  command
    .description('Diagnose your project dependencies')
    .option('-p, --path <path>', 'Project path', process.cwd())
    .option('-s, --simple', 'Show simple summary only', false)
    .option('--json', 'Output in JSON format', false)
    .option('--html <output>', 'Generate HTML report (e.g., --html report.html)', '')
    .action(async (options) => {
      const spinner = ora('Diagnosing dependencies...').start();

      try {
        const result = await diagnose(options.path);
        spinner.succeed('Diagnosis completed');

        // Generate HTML report if requested
        if (options.html) {
          const outputPath = path.isAbsolute(options.html)
            ? options.html
            : path.join(process.cwd(), options.html);

          await generateHTMLReport(result, outputPath);
          console.log(chalk.green(`\n✅ HTML report generated: ${outputPath}\n`));
        }

        // Show console output
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else if (options.simple) {
          console.log(generateSimpleSummary(result));
        } else if (!options.html) {
          // Only show full report if not generating HTML
          console.log(generateReport(result));
        }

        // Exit with code 1 if health score is low
        if (result.score.overall < 60) {
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Diagnosis failed');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  return command;
}
