import { DetectorFunction, DetectionResult } from '../types/index.js';
import { detect as detectNode } from './node.detector.js';
import { detect as detectPython } from './python.detector.js';
import { detect as detectDocker } from './docker.detector.js';
import { detect as detectCI } from './ci.detector.js';
import { detect as detectJava } from './java.detector.js';
import { detect as detectGo } from './go.detector.js';

const detectors: DetectorFunction[] = [
  detectNode,
  detectPython,
  detectDocker,
  detectCI,
  detectJava,
  detectGo,
];

export async function runAllDetectors(
  projectRoot: string
): Promise<DetectionResult[]> {
  const results = await Promise.all(
    detectors.map((detector) => detector(projectRoot))
  );

  return results.filter((r): r is DetectionResult => r !== null);
}
