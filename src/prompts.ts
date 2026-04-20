import inquirer from 'inquirer';
import { AnalyzedStack, DetectionResult } from './types/index.js';
import { AVAILABLE_SKILL_STACKS } from './constants.js';

export async function promptForModify(): Promise<boolean> {
  const { shouldModify } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldModify',
      message: 'Would you like to modify the detected stacks?',
      default: false,
    },
  ]);
  return shouldModify;
}

export async function promptForConfirmation(
  stacks: DetectionResult[]
): Promise<boolean> {
  const stackNames = stacks.map((s) => s.stack).join(', ');
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `Proceed with: ${stackNames}?`,
      default: true,
    },
  ]);
  return confirmed;
}

export async function promptForStackEdit(
  analyzed: AnalyzedStack
): Promise<DetectionResult[]> {
  const detectedNames = new Set(analyzed.stacks.map((s) => s.stack));

  const allChoices = AVAILABLE_SKILL_STACKS.map((stack) => ({
    name: detectedNames.has(stack)
      ? `${stack} (detected)`
      : stack,
    value: stack,
    checked: detectedNames.has(stack),
  }));

  const { selectedStacks } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedStacks',
      message: 'Select skills to include:',
      choices: allChoices,
    },
  ]);

  return selectedStacks.map((stack: string) => {
    const existing = analyzed.stacks.find((s) => s.stack === stack);
    return existing ?? { stack, confidence: 1, evidence: ['Manually selected'] };
  });
}
