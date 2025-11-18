#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createDiagnoseCommand } from './commands/diagnose';
import { createHealCommand } from './commands/heal';

const program = new Command();

program
  .name('dependency-therapist')
  .description('🏥 AI-powered dependency health diagnostics for Node.js projects')
  .version('0.2.0');

// Add commands
program.addCommand(createDiagnoseCommand());
program.addCommand(createHealCommand());

// Default command (when run without arguments)
if (process.argv.length === 2) {
  console.log(chalk.cyan.bold('\n🏥 Welcome to Dependency Therapist!\n'));
  console.log('Usage:');
  console.log('  $ dependency-therapist diagnose           Diagnose your project');
  console.log('  $ dependency-therapist diagnose --html    Generate HTML report');
  console.log('  $ dependency-therapist heal              Auto-fix issues');
  console.log('  $ dependency-therapist heal --dry-run    Preview fixes');
  console.log('');
  console.log('More info: dependency-therapist --help');
  console.log('');
  process.exit(0);
}

program.parse();
