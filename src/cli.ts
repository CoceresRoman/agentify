#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const packageJson = JSON.parse(
    await readFile(join(__dirname, '../package.json'), 'utf-8')
  );

  const program = new Command();

  program
    .name('agentify')
    .description(
      'Auto-detect project stacks and generate Claude Code configuration'
    )
    .version(packageJson.version);

  program
    .command('init')
    .description('Initialize Claude Code configuration for the current project')
    .option('-y, --yes', 'Skip confirmation prompts and use auto-detected stacks')
    .option('--no-interaction', 'Run without any user prompts')
    .option('-d, --debug', 'Enable debug logging')
    .option(
      '-o, --output <path>',
      'Custom output directory (default: .claude)',
      '.claude'
    )
    .action(initCommand);

  program
    .command('add <skill>')
    .description('Add a community skill to your project')
    .action((skill: string) => {
      console.log(`Command 'add ${skill}' is not yet implemented.`);
      process.exit(1);
    });

  await program.parseAsync(process.argv);
}

process.on('unhandledRejection', (error: Error) => {
  console.error(`Unhandled error: ${error.message}`);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nOperation cancelled by user');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
