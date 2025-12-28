import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { runAutoFix } from '../../healer/auto-fix';
import { t } from '../../i18n';

export function createHealCommand(): Command {
  const command = new Command('heal');

  command
    .description('Automatically fix dependency issues')
    .option('-p, --path <path>', 'Project path', process.cwd())
    .option('--dry-run', 'Show what would be fixed without making changes', false)
    .option('--force', 'Force fix (may include breaking changes)', false)
    .option('--skip-audit', 'Skip security audit fix', false)
    .option('--skip-update', 'Skip dependency updates', false)
    .option('-y, --yes', 'Skip confirmation prompt', false)
    .action(async (options) => {
      console.log(chalk.cyan.bold(`\n🏥 ${t('autoHealTitle')}\n`));

      if (!options.yes && !options.dryRun) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: t('healConfirmMessage'),
            default: false,
          },
        ]);

        if (!answers.proceed) {
          console.log(chalk.yellow(`\n${t('healCancelled')}\n`));
          return;
        }
      }

      if (options.dryRun) {
        console.log(chalk.yellow(`🔍 ${t('dryRunMode')}\n`));
      }

      const spinner = ora(t('analyzingAndFixing')).start();

      try {
        const results = await runAutoFix(options.path, {
          force: options.force,
          dryRun: options.dryRun,
          skipAudit: options.skipAudit,
          skipUpdate: options.skipUpdate,
        });

        spinner.succeed(t('healingCompleted'));

        // Display audit fix results
        console.log(chalk.bold(`\n📋 ${t('securityAuditFix')}:`));
        if (results.audit.success) {
          results.audit.fixed.forEach(item => {
            console.log(chalk.green(`  ✓ ${item}`));
          });
        }
        if (results.audit.failed.length > 0) {
          results.audit.failed.forEach(item => {
            console.log(chalk.red(`  ✗ ${item}`));
          });
        }
        if (results.audit.skipped.length > 0) {
          results.audit.skipped.forEach(item => {
            console.log(chalk.gray(`  ⊘ ${item}`));
          });
        }

        // Display update results
        console.log(chalk.bold(`\n📦 ${t('dependencyUpdates')}:`));
        if (results.update.success) {
          results.update.fixed.forEach(item => {
            console.log(chalk.green(`  ✓ ${item}`));
          });
        }
        if (results.update.failed.length > 0) {
          results.update.failed.forEach(item => {
            console.log(chalk.red(`  ✗ ${item}`));
          });
        }
        if (results.update.skipped.length > 0) {
          if (options.dryRun) {
            console.log(chalk.yellow(`  ${t('wouldUpdate')}:`));
          }
          results.update.skipped.slice(0, 10).forEach(item => {
            console.log(chalk.gray(`    - ${item}`));
          });
          if (results.update.skipped.length > 10) {
            console.log(chalk.gray(`    ... ${t('andMoreItems', { count: results.update.skipped.length - 10 })}`));
          }
        }

        // Display next steps
        console.log(chalk.bold(`\n💡 ${t('nextStepsTitle')}:`));
        if (options.dryRun) {
          console.log(chalk.cyan(`  1. ${t('reviewChanges')}`));
          console.log(chalk.cyan(`  2. ${t('runWithoutDryRun')}`));
          console.log(chalk.cyan(`  3. ${t('runDiagnoseAgain')}`));
        } else {
          console.log(chalk.cyan(`  1. ${t('testApplication')}`));
          console.log(chalk.cyan(`  2. ${t('runDiagnoseAgain')}`));
          console.log(chalk.cyan(`  3. ${t('commitChanges')}`));
        }

        console.log('');

        // Exit with error code if both operations failed
        if (!results.audit.success && !results.update.success) {
          process.exit(1);
        }
      } catch (error) {
        spinner.fail(t('healingFailed'));
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  return command;
}
