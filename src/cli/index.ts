#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createDiagnoseCommand } from './commands/diagnose';
import { createHealCommand } from './commands/heal';
import { t } from '../i18n';

const program = new Command();

program
  .name('dependency-therapist')
  .description(`🏥 ${t('cliDescription')}`)
  .version('0.2.0');

// Add commands
program.addCommand(createDiagnoseCommand());
program.addCommand(createHealCommand());

// Default command (when run without arguments)
if (process.argv.length === 2) {
  console.log(chalk.cyan.bold(`\n🏥 ${t('welcomeMessage')}\n`));
  console.log(`${t('usage')}:`);
  console.log(`  $ dependency-therapist diagnose           ${t('diagnoseDesc')}`);
  console.log(`  $ dependency-therapist diagnose --html    ${t('diagnoseHtmlDesc')}`);
  console.log(`  $ dependency-therapist heal              ${t('autoFixDesc')}`);
  console.log(`  $ dependency-therapist heal --dry-run    ${t('previewFixesDesc')}`);
  console.log('');
  console.log(`${t('moreInfo')}: dependency-therapist --help`);
  console.log('');
  process.exit(0);
}

program.parse();
