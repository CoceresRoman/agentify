import { join } from 'path';
import { fileExists, readFile, findFiles } from '../utils/file-system.js';
import { DetectionResult, DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (
  projectRoot: string
): Promise<DetectionResult | null> => {
  const evidence: string[] = [];
  let confidence = 0;

  const gradleKtsPath = join(projectRoot, 'build.gradle.kts');
  const settingsKtsPath = join(projectRoot, 'settings.gradle.kts');

  if (await fileExists(gradleKtsPath)) {
    evidence.push('Found build.gradle.kts (Kotlin DSL)');
    confidence += 0.5;
  }

  if (await fileExists(settingsKtsPath)) {
    evidence.push('Found settings.gradle.kts');
    confidence += 0.1;
  }

  const gradleKtsContent = await readFile(gradleKtsPath);
  const gradleContent = await readFile(join(projectRoot, 'build.gradle'));
  const pomContent = await readFile(join(projectRoot, 'pom.xml'));
  const buildContent = gradleKtsContent ?? gradleContent ?? pomContent ?? '';

  if (buildContent.includes('org.jetbrains.kotlin')) {
    evidence.push('Found org.jetbrains.kotlin plugin/dependency');
    confidence += 0.3;
  }

  if (buildContent.includes('kotlin-stdlib') || buildContent.includes('kotlin("jvm")')) {
    evidence.push('Found Kotlin stdlib');
    confidence += 0.2;
  }

  if (pomContent?.includes('kotlin')) {
    evidence.push('Found Kotlin in Maven dependencies');
    confidence += 0.2;
  }

  const ktFiles = await findFiles('src/**/*.kt', projectRoot);
  if (ktFiles.length > 0) {
    evidence.push(`Found ${ktFiles.length} Kotlin source file(s)`);
    confidence += 0.3;
  }

  if (confidence < 0.7) return null;

  const metadata: Record<string, unknown> = {};
  const versionMatch = buildContent.match(/kotlin(?:Version)?\s*[=:]\s*["']([^"']+)["']/);
  if (versionMatch) {
    metadata.version = versionMatch[1];
  }

  return {
    stack: 'kotlin',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata,
  };
};
