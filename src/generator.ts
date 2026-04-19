import Handlebars from 'handlebars';
import { readFile as fsReadFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DetectionResult } from './types/index.js';
import { TemplateError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

export async function generateFiles(
  stacks: DetectionResult[],
  projectRoot: string
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  try {
    const claudeTemplate = await loadTemplate('claude-md/base.hbs');
    files['CLAUDE.md'] = claudeTemplate({
      stacks: stacks.map((s) => s.stack),
      projectRoot,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new TemplateError(
      `Failed to generate CLAUDE.md: ${(error as Error).message}`,
      'claude-md/base.hbs'
    );
  }

  for (const stack of stacks) {
    try {
      const skillTemplate = await loadTemplate(
        `skills/${stack.stack}/SKILL.md.hbs`
      );
      files[`skills/${stack.stack}/SKILL.md`] = skillTemplate({
        ...stack.metadata,
        evidence: stack.evidence,
      });
    } catch (error) {
      console.warn(`No template found for stack: ${stack.stack}`);
    }
  }

  return files;
}

async function loadTemplate(
  relativePath: string
): Promise<HandlebarsTemplateDelegate> {
  const templatePath = join(__dirname, 'templates', relativePath);
  const templateContent = await fsReadFile(templatePath, 'utf-8');
  return Handlebars.compile(templateContent);
}
