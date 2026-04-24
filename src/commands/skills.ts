import ora from 'ora';
import chalk from 'chalk';
import { listSkills } from '../registry/anthropic.js';
import { logger } from '../utils/logger.js';

export async function skillsListCommand() {
  const spinner = ora('Fetching skills registry...').start();

  let skills;
  try {
    skills = await listSkills();
    spinner.succeed(`${skills.length} skills available`);
  } catch (error) {
    spinner.fail('Failed to fetch registry');
    logger.error((error as Error).message);
    process.exit(1);
  }

  const termWidth = process.stdout.columns || 120;
  const maxNameLen = Math.max(...skills.map((s) => s.name.length));
  const nameColWidth = maxNameLen + 2;
  const descColWidth = termWidth - nameColWidth - 7; // borders + padding

  const border = chalk.gray('─');
  const topLine = chalk.gray('┌' + border.repeat(nameColWidth + 2) + '┬' + border.repeat(descColWidth + 2) + '┐');
  const midLine = chalk.gray('├' + border.repeat(nameColWidth + 2) + '┼' + border.repeat(descColWidth + 2) + '┤');
  const botLine = chalk.gray('└' + border.repeat(nameColWidth + 2) + '┴' + border.repeat(descColWidth + 2) + '┘');
  const sep = chalk.gray('│');

  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max - 1) + '…' : s;
  const row = (name: string, desc: string, colored = false) => {
    const n = colored ? chalk.cyan(name.padEnd(nameColWidth)) : chalk.bold(name.padEnd(nameColWidth));
    const d = truncate(desc, descColWidth).padEnd(descColWidth);
    return `${sep} ${n} ${sep} ${d} ${sep}`;
  };

  console.log(`\n${chalk.bold('Available skills from anthropics/skills:')}\n`);
  console.log(topLine);
  console.log(row('Name', 'Description'));
  console.log(midLine);
  for (const skill of skills) {
    console.log(row(skill.name, skill.description, true));
  }
  console.log(botLine);

  console.log(`\n${chalk.gray(`Install:          agentify add <name>`)}`);
  console.log(`${chalk.gray(`Interactive pick: agentify add`)}\n`);
}
