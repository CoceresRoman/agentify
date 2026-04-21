import { join } from 'path';
import { fileExists, readFile, findFiles } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const evidence: string[] = [];
  let confidence = 0;
  const metadata: Record<string, unknown> = {};

  const pomPath = join(projectRoot, 'pom.xml');
  const gradlePath = join(projectRoot, 'build.gradle');
  const gradleKtsPath = join(projectRoot, 'build.gradle.kts');

  const hasPom = await fileExists(pomPath);
  const hasGradle = await fileExists(gradlePath);
  const hasGradleKts = await fileExists(gradleKtsPath);

  if (!hasPom && !hasGradle && !hasGradleKts) return null;

  if (hasPom) {
    evidence.push('Found pom.xml');
    confidence += 0.4;
    const content = await readFile(pomPath);
    if (content) {
      const versionMatch = content.match(/<java\.version>([\d.]+)<\/java\.version>/);
      if (versionMatch) {
        metadata.javaVersion = versionMatch[1];
        evidence.push(`Java version ${versionMatch[1]}`);
        confidence += 0.2;
      }
    }
  }

  if (hasGradle) {
    evidence.push('Found build.gradle');
    confidence += 0.4;
    const content = await readFile(gradlePath);
    if (content) {
      const versionMatch = content.match(/sourceCompatibility\s*=\s*['"]?([^'"}\s]+)/);
      if (versionMatch) {
        metadata.javaVersion = versionMatch[1];
        evidence.push(`Java source compatibility ${versionMatch[1]}`);
        confidence += 0.1;
      }
    }
  }

  if (hasGradleKts) {
    evidence.push('Found build.gradle.kts');
    confidence += 0.2;
  }

  const javaFiles = await findFiles('src/**/*.java', projectRoot);
  if (javaFiles.length > 0) {
    evidence.push(`Found ${javaFiles.length} Java source file(s)`);
    confidence += 0.3;
  }

  if (confidence < 0.7) return null;

  return {
    stack: 'java',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata,
  };
};
