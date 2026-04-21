import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const evidence: string[] = [];
  let confidence = 0;

  const pomPath = join(projectRoot, 'pom.xml');
  const gradlePath = join(projectRoot, 'build.gradle');
  const gradleKtsPath = join(projectRoot, 'build.gradle.kts');

  const pomContent = await readFile(pomPath);
  const gradleContent =
    (await readFile(gradlePath)) ?? (await readFile(gradleKtsPath));
  const content = pomContent ?? gradleContent ?? '';

  if (!content) return null;

  if (content.includes('spring-boot')) {
    evidence.push('Found spring-boot dependency');
    confidence += 0.5;
  }

  if (
    content.includes('org.springframework.boot') ||
    content.includes('springframework.boot')
  ) {
    evidence.push('Found org.springframework.boot plugin/package');
    confidence += 0.3;
  }

  if (pomContent?.includes('<groupId>org.springframework.boot</groupId>')) {
    evidence.push('Found Spring Boot parent in pom.xml');
    confidence += 0.2;
  }

  if (gradleContent?.includes('org.springframework.boot')) {
    evidence.push('Found Spring Boot plugin in Gradle');
    confidence += 0.2;
  }

  if (confidence < 0.7) return null;

  const metadata: Record<string, unknown> = {};
  const versionMatch = content.match(/spring-boot[^"']*['"]([\d.]+)['"]/);
  if (versionMatch) metadata.version = versionMatch[1];

  // Check if pom or gradle exists before returning
  const hasBuildFile =
    (await fileExists(pomPath)) ||
    (await fileExists(gradlePath)) ||
    (await fileExists(gradleKtsPath));

  if (!hasBuildFile) return null;

  return {
    stack: 'spring-boot',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata,
  };
};
