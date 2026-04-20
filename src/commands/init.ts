import ora from 'ora';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { runAllDetectors } from '../detectors/index.js';
import { analyzeStack } from '../analyzer.js';
import { promptForConfirmation, promptForModify, promptForStackEdit } from '../prompts.js';
import { generateFiles } from '../generator.js';
import { writeFiles } from '../writer.js';
import { fileExists } from '../utils/file-system.js';

type InitOptions = {
  yes?: boolean;
  noInteraction?: boolean;
  debug?: boolean;
  output?: string;
};

export async function initCommand(options: InitOptions) {
  const projectRoot = process.cwd();

  if (options.debug) {
    process.env.DEBUG = 'true';
  }

  logger.info(`Analyzing project at: ${projectRoot}\n`);

  const spinner = ora('Detecting project stacks...').start();

  try {
    const detectionResults = await runAllDetectors(projectRoot);
    spinner.succeed(`Detected ${detectionResults.length} potential stacks`);

    if (detectionResults.length === 0) {
      logger.warn(
        'No stacks detected. Please check if this is a valid project directory.'
      );
      process.exit(0);
    }

    const analyzed = await analyzeStack(detectionResults, projectRoot);

    console.log('\nDetected stacks:');
    analyzed.stacks.forEach((result) => {
      const confidencePercent = (result.confidence * 100).toFixed(0);
      logger.info(`  - ${result.stack} (${confidencePercent}% confidence)`);
      result.evidence.forEach((e) => console.log(`    • ${e}`));
    });

    let confirmedStacks = analyzed.stacks;

    if (!options.yes && !options.noInteraction) {
      const shouldModify = await promptForModify();

      if (shouldModify) {
        confirmedStacks = await promptForStackEdit(analyzed);
      } else {
        const confirmed = await promptForConfirmation(confirmedStacks);
        if (!confirmed) {
          logger.warn('Cancelled.');
          process.exit(0);
        }
      }
    }

    if (confirmedStacks.length === 0) {
      logger.warn('No stacks selected. Exiting.');
      process.exit(0);
    }

    const outputDir = options.output || '.claude';

    const rootClaudeMd = join(projectRoot, 'CLAUDE.md');
    const dotClaudeClaudeMd = join(projectRoot, outputDir, 'CLAUDE.md');
    const claudeMdExists =
      (await fileExists(rootClaudeMd)) || (await fileExists(dotClaudeClaudeMd));
    const claudeMdAppendTarget = (await fileExists(rootClaudeMd))
      ? rootClaudeMd
      : dotClaudeClaudeMd;

    const generatedFiles = await generateFiles(confirmedStacks, projectRoot, claudeMdExists);
    await writeFiles(generatedFiles, projectRoot, outputDir, claudeMdAppendTarget);

    logger.success(
      `\n✓ Successfully generated Claude Code configuration in ${outputDir}/`
    );
    if (claudeMdExists) {
      logger.info('  - CLAUDE.md (updated: skills section appended)');
    } else {
      logger.info('  - CLAUDE.md');
    }
    confirmedStacks.forEach((s) => {
      logger.info(`  - skills/${s.stack}/SKILL.md`);
    });
  } catch (error) {
    spinner.fail('Detection failed');
    throw error;
  }
}
