import ora from 'ora';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { listSkills, fetchSkillContent } from '../registry/anthropic.js';
import { fetchCommunitySkillContent, isCommunityRepo } from '../registry/community.js';
import { scanSkill } from '../security/scanner.js';

type AddOptions = {
  output?: string;
};

export async function addCommand(skillName: string | undefined, options: AddOptions) {
  const outputDir = options.output || '.claude';
  const projectRoot = process.cwd();

  if (skillName && isCommunityRepo(skillName)) {
    await installCommunitySkill(skillName, outputDir, projectRoot);
    return;
  }

  await installAnthropicSkill(skillName, outputDir, projectRoot);
}

async function installAnthropicSkill(
  skillName: string | undefined,
  outputDir: string,
  projectRoot: string
) {
  const fetchSpinner = ora('Fetching available skills...').start();
  let skills;
  try {
    skills = await listSkills();
    fetchSpinner.succeed(`Found ${skills.length} skills in Anthropic registry`);
  } catch (error) {
    fetchSpinner.fail('Failed to fetch skills registry');
    logger.error(`Network error: ${(error as Error).message}`);
    process.exit(1);
  }

  let targetName: string;

  if (skillName) {
    const found = skills.find((s) => s.name === skillName);
    if (!found) {
      logger.error(`Skill "${skillName}" not found in Anthropic registry.`);
      logger.info('Run "agentify skills list" to see available skills.');
      logger.info('For community skills: agentify search <query>');
      process.exit(1);
    }
    targetName = skillName;
  } else {
    const maxNameLen = Math.max(...skills.map((s) => s.name.length));
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select a skill to install:',
        choices: skills.map((s) => {
          const desc = s.description.length > 65
            ? s.description.slice(0, 62) + '...'
            : s.description;
          return {
            name: `${s.name.padEnd(maxNameLen + 2)} ${desc}`,
            value: s.name,
            short: s.name,
          };
        }),
        pageSize: 15,
      },
    ]);
    targetName = selected;
  }

  const downloadSpinner = ora(`Downloading ${targetName}...`).start();
  let content: string;
  try {
    content = await fetchSkillContent(targetName);
    downloadSpinner.succeed(`Downloaded ${targetName}`);
  } catch (error) {
    downloadSpinner.fail('Failed to download skill');
    logger.error((error as Error).message);
    process.exit(1);
  }

  await scanAndInstall(content, targetName, outputDir, projectRoot, false);
}

async function installCommunitySkill(repo: string, outputDir: string, projectRoot: string) {
  console.log(chalk.yellow(`\n⚠  Community skill — not verified by Anthropic: ${repo}\n`));

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Continue installing from this repository?',
      default: false,
    },
  ]);

  if (!proceed) {
    logger.warn('Installation cancelled.');
    process.exit(0);
  }

  const repoSlug = repo.split('/')[1];
  const downloadSpinner = ora(`Downloading SKILL.md from ${repo}...`).start();
  let content: string;
  try {
    content = await fetchCommunitySkillContent(repo);
    downloadSpinner.succeed(`Downloaded ${repo}`);
  } catch (error) {
    downloadSpinner.fail('Failed to download skill');
    logger.error((error as Error).message);
    process.exit(1);
  }

  await scanAndInstall(content, repoSlug, outputDir, projectRoot, true);
}

async function scanAndInstall(
  content: string,
  skillName: string,
  outputDir: string,
  projectRoot: string,
  isCommunity: boolean
) {
  const scanSpinner = ora('Scanning for security issues...').start();
  const { safe, warnings } = scanSkill(content);

  if (!safe) {
    scanSpinner.warn('Security warnings detected:');
    warnings.forEach((w) => logger.warn(`  ⚠  ${w}`));
    console.log();

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Install anyway?',
        default: false,
      },
    ]);

    if (!proceed) {
      logger.warn('Installation cancelled.');
      process.exit(0);
    }
  } else {
    scanSpinner.succeed('No security issues found');
  }

  const skillDir = join(projectRoot, outputDir, 'skills', skillName);
  const skillPath = join(skillDir, 'SKILL.md');

  try {
    await mkdir(skillDir, { recursive: true });
    await writeFile(skillPath, content, 'utf-8');
  } catch (error) {
    logger.error(`Failed to write skill: ${(error as Error).message}`);
    process.exit(1);
  }

  logger.success(`\n✓ Skill installed: ${outputDir}/skills/${skillName}/SKILL.md`);
  logger.info('\nClaude Code will detect this skill automatically on next session.');

  if (!isCommunity) {
    logger.info('\nEquivalent manual command (inside Claude Code):');
    logger.info('  /plugin install example-skills@anthropic-agent-skills');
  }
}
