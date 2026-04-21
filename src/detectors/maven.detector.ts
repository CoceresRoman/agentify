import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const pomPath = join(projectRoot, 'pom.xml');
  if (!(await fileExists(pomPath))) return null;

  const content = await readFile(pomPath);
  if (!content) return null;

  const evidence: string[] = ['Found pom.xml'];
  let confidence = 0.5;
  const metadata: Record<string, unknown> = {};

  if (content.includes('<modelVersion>')) {
    evidence.push('Valid Maven POM structure');
    confidence += 0.2;
  }

  const wrapperPath = join(projectRoot, 'mvnw');
  if (await fileExists(wrapperPath)) {
    evidence.push('Found Maven wrapper (mvnw)');
    confidence += 0.2;
  }

  const versionMatch = content.match(/<maven\.compiler\.source>([\d.]+)<\/maven\.compiler\.source>/);
  if (versionMatch) {
    metadata.compilerVersion = versionMatch[1];
    evidence.push(`Maven compiler source ${versionMatch[1]}`);
    confidence += 0.1;
  }

  const groupMatch = content.match(/<groupId>([^<]+)<\/groupId>/);
  if (groupMatch) {
    metadata.groupId = groupMatch[1];
  }

  return {
    stack: 'maven',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata,
  };
};
