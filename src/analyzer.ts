import { DetectionResult, AnalyzedStack } from './types/index.js';
import { CONFIDENCE_THRESHOLD } from './constants.js';

export async function analyzeStack(
  results: DetectionResult[],
  projectRoot: string
): Promise<AnalyzedStack> {
  const filtered = results.filter((r) => r.confidence >= CONFIDENCE_THRESHOLD);

  filtered.sort((a, b) => b.confidence - a.confidence);

  return {
    stacks: filtered,
    projectRoot,
    timestamp: new Date(),
  };
}
