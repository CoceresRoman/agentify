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
  const descColWidth = termWidth - nameColWidth - 7;

  const wordWrap = (text: string, width: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current ? current + ' ' + word : word).length <= width) {
        current = current ? current + ' ' + word : word;
      } else {
        if (current) lines.push(current);
        current = word.length > width ? word.slice(0, width) : word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const sep = chalk.gray('│');
  const b = '─';
  const topLine = chalk.gray('┌' + b.repeat(nameColWidth + 2) + '┬' + b.repeat(descColWidth + 2) + '┐');
  const midLine = chalk.gray('├' + b.repeat(nameColWidth + 2) + '┼' + b.repeat(descColWidth + 2) + '┤');
  const botLine = chalk.gray('└' + b.repeat(nameColWidth + 2) + '┴' + b.repeat(descColWidth + 2) + '┘');

  const printRow = (name: string, desc: string, colored = false) => {
    const lines = wordWrap(desc, descColWidth);
    const n = colored ? chalk.cyan(name.padEnd(nameColWidth)) : chalk.bold(name.padEnd(nameColWidth));
    console.log(`${sep} ${n} ${sep} ${lines[0].padEnd(descColWidth)} ${sep}`);
    for (let i = 1; i < lines.length; i++) {
      console.log(`${sep} ${' '.repeat(nameColWidth)} ${sep} ${lines[i].padEnd(descColWidth)} ${sep}`);
    }
  };

  console.log(`\n${chalk.bold('Available skills from anthropics/skills:')}\n`);
  console.log(topLine);
  printRow('Name', 'Description');
  console.log(midLine);
  for (let i = 0; i < skills.length; i++) {
    printRow(skills[i].name, skills[i].description, true);
    if (i < skills.length - 1) console.log(midLine);
  }
  console.log(botLine);

  console.log(`\n${chalk.gray(`Install:          agentify add <name>`)}`);
  console.log(`${chalk.gray(`Interactive pick: agentify add`)}\n`);
}
