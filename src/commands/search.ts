import ora from 'ora';
import chalk from 'chalk';
import { searchSkills } from '../registry/community.js';
import { logger } from '../utils/logger.js';

export async function searchCommand(query: string) {
  const spinner = ora(`Searching community skills for "${query}"...`).start();

  let skills;
  try {
    skills = await searchSkills(query);
    spinner.succeed(`Found ${skills.length} community skills`);
  } catch (error) {
    spinner.fail('Search failed');
    logger.error((error as Error).message);
    process.exit(1);
  }

  if (skills.length === 0) {
    logger.warn(`No community skills found for "${query}".`);
    logger.info('Try broader terms or check: https://github.com/topics/claude-skill');
    return;
  }

  const maxRepoLen = Math.max(...skills.map((s) => s.repo.length));

  console.log(`\n${chalk.bold(`Community skills matching "${query}":`)} ${chalk.gray('(sorted by stars)')}\n`);

  for (const skill of skills) {
    const stars = chalk.yellow(`★ ${skill.stars}`);
    const repo = chalk.cyan(skill.repo.padEnd(maxRepoLen + 2));
    const desc = skill.description.length > 60
      ? skill.description.slice(0, 57) + '...'
      : skill.description;
    console.log(`  ${repo} ${stars.padEnd(10)} ${desc}`);
  }

  console.log(`\n${chalk.gray('Install:  agentify add <user/repo>')}`);
  console.log(`${chalk.gray('Example:  agentify add dpconde/claude-android-skill')}\n`);
}
