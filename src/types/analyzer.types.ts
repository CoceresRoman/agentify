import { DetectionResult } from './detector.types.js';

export type AnalyzedStack = {
  stacks: DetectionResult[];
  projectRoot: string;
  timestamp: Date;
};

export type StackContext = {
  stacks: string[];
  confidence: Record<string, number>;
  evidence: Record<string, string[]>;
  projectRoot: string;
  projectName: string;
};
