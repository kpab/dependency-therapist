#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createDiagnoseCommand } from './commands/diagnose';

const program = new Command();

program
  .name('dependency-therapist')
  .description('🏥 AI-powered dependency health diagnostics for Node.js projects')
  .version('0.1.0');

// コマンドを追加
program.addCommand(createDiagnoseCommand());

// デフォルトコマンド（引数なしで実行された場合）
if (process.argv.length === 2) {
  console.log(chalk.cyan.bold('\n🏥 Dependency Therapist へようこそ！\n'));
  console.log('使い方:');
  console.log('  $ dependency-therapist diagnose        プロジェクトを診断');
  console.log('  $ dependency-therapist diagnose --help 詳細なヘルプ');
  console.log('');
  console.log('もっと詳しく: dependency-therapist --help');
  console.log('');
  process.exit(0);
}

program.parse();
