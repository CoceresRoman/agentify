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

  const maxNameLen = Math.max(...skills.map((s) => s.name.length));

  console.log(`\n${chalk.bold('Available skills from anthropics/skills:')}\n`);

  for (const skill of skills) {
    console.log(`  ${chalk.cyan(skill.name.padEnd(maxNameLen + 2))} ${skill.description}`);
  }

  console.log(`\n${chalk.gray(`Install:          agentify add <name>`)}`);
  console.log(`${chalk.gray(`Interactive pick: agentify add`)}\n`);
}
