import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { runAutoFix } from '../../healer/auto-fix';

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
      console.log(chalk.cyan.bold('\n🏥 Dependency Therapist - Auto Heal\n'));

      if (!options.yes && !options.dryRun) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'This will modify your package files. Backups will be created. Continue?',
            default: false,
          },
        ]);

        if (!answers.proceed) {
          console.log(chalk.yellow('\nHealing cancelled.\n'));
          return;
        }
      }

      if (options.dryRun) {
        console.log(chalk.yellow('🔍 Dry run mode - no changes will be made\n'));
      }

      const spinner = ora('Analyzing and fixing issues...').start();

      try {
        const results = await runAutoFix(options.path, {
          force: options.force,
          dryRun: options.dryRun,
          skipAudit: options.skipAudit,
          skipUpdate: options.skipUpdate,
        });

        spinner.succeed('Healing process completed');

        // Display audit fix results
        console.log(chalk.bold('\n📋 Security Audit Fix:'));
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
        console.log(chalk.bold('\n📦 Dependency Updates:'));
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
            console.log(chalk.yellow('  Would update:'));
          }
          results.update.skipped.slice(0, 10).forEach(item => {
            console.log(chalk.gray(`    - ${item}`));
          });
          if (results.update.skipped.length > 10) {
            console.log(chalk.gray(`    ... and ${results.update.skipped.length - 10} more`));
          }
        }

        // Display next steps
        console.log(chalk.bold('\n💡 Next Steps:'));
        if (options.dryRun) {
          console.log(chalk.cyan('  1. Review the changes above'));
          console.log(chalk.cyan('  2. Run without --dry-run to apply fixes'));
          console.log(chalk.cyan('  3. Run diagnose again to verify improvements'));
        } else {
          console.log(chalk.cyan('  1. Test your application thoroughly'));
          console.log(chalk.cyan('  2. Run diagnose again to verify improvements'));
          console.log(chalk.cyan('  3. Commit the changes if everything works'));
        }

        console.log('');

        // Exit with error code if both operations failed
        if (!results.audit.success && !results.update.success) {
          process.exit(1);
        }
      } catch (error) {
        spinner.fail('Healing failed');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  return command;
}
