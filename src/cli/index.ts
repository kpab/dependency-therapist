#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createDiagnoseCommand } from './commands/diagnose';
import { createHealCommand } from './commands/heal';
import { t, setLocale, Locale } from '../i18n';

// Parse --lang option early before other processing
function detectLocale(): Locale {
  const langIndex = process.argv.findIndex(arg => arg === '--lang' || arg === '-l');
  if (langIndex !== -1 && process.argv[langIndex + 1]) {
    const lang = process.argv[langIndex + 1];
    if (lang === 'ja' || lang === 'en') {
      return lang;
    }
  }
  // Auto-detect from environment
  const envLang = process.env.LANG || process.env.LC_ALL || '';
  if (envLang.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

// Set locale before creating commands
setLocale(detectLocale());

const program = new Command();

program
  .name('dependency-therapist')
  .description(`🏥 ${t('cliDescription')}`)
  .version('0.2.0')
  .option('-l, --lang <locale>', 'Language (en, ja)', detectLocale());

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
