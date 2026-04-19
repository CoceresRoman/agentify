import inquirer from 'inquirer';
import { AnalyzedStack, DetectionResult } from './types/index.js';

export async function promptForConfirmation(): Promise<boolean> {
  const { shouldEdit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldEdit',
      message: 'Would you like to edit the detected stacks?',
      default: false,
    },
  ]);

  return shouldEdit;
}

export async function promptForStackEdit(
  analyzed: AnalyzedStack
): Promise<DetectionResult[]> {
  const stackChoices = analyzed.stacks.map((s) => ({
    name: `${s.stack} (${(s.confidence * 100).toFixed(0)}% confidence)`,
    value: s.stack,
    checked: true,
  }));

  const { selectedStacks } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedStacks',
      message: 'Select which stacks to include:',
      choices: stackChoices,
    },
  ]);

  return analyzed.stacks.filter((s) => selectedStacks.includes(s.stack));
}
