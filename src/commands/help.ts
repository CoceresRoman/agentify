import chalk from 'chalk';

type Row = { command: string; usage: string; description: string };

const ROWS: Row[] = [
  {
    command: 'init',
    usage: 'agentify init [--yes] [--debug] [-o <dir>]',
    description: 'Detect project stacks and generate .claude/ config',
  },
  {
    command: 'add',
    usage: 'agentify add [<name>]',
    description: 'Install skill from Anthropic registry (interactive picker if no name)',
  },
  {
    command: 'add <user/repo>',
    usage: 'agentify add octocat/my-skill',
    description: 'Install community skill from GitHub',
  },
  {
    command: 'skills list',
    usage: 'agentify skills list',
    description: 'Browse all skills in Anthropic registry',
  },
  {
    command: 'search <query>',
    usage: 'agentify search <query>',
    description: 'Find community skills on GitHub (topic:claude-skill)',
  },
  {
    command: 'help',
    usage: 'agentify help',
    description: 'Show this table',
  },
];

function pad(str: string, len: number) {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

export function helpCommand() {
  const cols = {
    command: Math.max(...ROWS.map((r) => r.command.length), 'Command'.length),
    usage: Math.max(...ROWS.map((r) => r.usage.length), 'Usage'.length),
    description: Math.max(...ROWS.map((r) => r.description.length), 'Description'.length),
  };

  const sep = (l: string, m: string, r: string, fill: string) =>
    l +
    fill.repeat(cols.command + 2) +
    m +
    fill.repeat(cols.usage + 2) +
    m +
    fill.repeat(cols.description + 2) +
    r;

  const row = (r: Row) =>
    '│ ' +
    chalk.cyan(pad(r.command, cols.command)) +
    ' │ ' +
    chalk.gray(pad(r.usage, cols.usage)) +
    ' │ ' +
    pad(r.description, cols.description) +
    ' │';

  const header =
    '│ ' +
    chalk.bold(pad('Command', cols.command)) +
    ' │ ' +
    chalk.bold(pad('Usage', cols.usage)) +
    ' │ ' +
    chalk.bold(pad('Description', cols.description)) +
    ' │';

  console.log();
  console.log(chalk.bold.cyan('agentify') + chalk.gray(' — Auto-configure Claude Code for any project'));
  console.log();
  console.log(chalk.gray(sep('┌', '┬', '┐', '─')));
  console.log(header);
  console.log(chalk.gray(sep('├', '┼', '┤', '─')));
  for (const r of ROWS) {
    console.log(row(r));
  }
  console.log(chalk.gray(sep('└', '┴', '┘', '─')));
  console.log();
}
