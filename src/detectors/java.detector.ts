import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectionResult, DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const results: DetectionResult[] = [];

  // Maven (pom.xml)
  const pomPath = join(projectRoot, 'pom.xml');
  if (await fileExists(pomPath)) {
    const content = await readFile(pomPath);
    if (content) {
      const springBootResult = detectSpringBoot(content, 'maven');
      if (springBootResult) {
        results.push(springBootResult);
      } else {
        results.push({
          stack: 'maven',
          confidence: 0.8,
          evidence: ['Found pom.xml (Maven project)'],
        });
      }
    }
  }

  // Gradle (build.gradle or build.gradle.kts)
  const gradlePath = join(projectRoot, 'build.gradle');
  const gradleKtsPath = join(projectRoot, 'build.gradle.kts');

  if ((await fileExists(gradlePath)) || (await fileExists(gradleKtsPath))) {
    const content =
      (await readFile(gradlePath)) || (await readFile(gradleKtsPath));
    if (content) {
      const springBootResult = detectSpringBoot(content, 'gradle');
      if (springBootResult) {
        results.push(springBootResult);
      } else {
        results.push({
          stack: 'gradle',
          confidence: 0.8,
          evidence: ['Found build.gradle (Gradle project)'],
        });
      }
    }
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
};

function detectSpringBoot(
  content: string,
  buildTool: 'maven' | 'gradle'
): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (content.includes('spring-boot')) {
    evidence.push('Found Spring Boot dependencies');
    confidence += 0.7;
  }

  if (
    content.includes('org.springframework.boot') ||
    content.includes('springframework.boot')
  ) {
    evidence.push('Found Spring Boot packages');
    confidence += 0.2;
  }

  if (buildTool === 'maven' && content.includes('<groupId>org.springframework.boot</groupId>')) {
    evidence.push('Found Spring Boot in Maven dependencies');
    confidence += 0.1;
  }

  if (buildTool === 'gradle' && content.includes('org.springframework.boot')) {
    evidence.push('Found Spring Boot in Gradle dependencies');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'spring-boot',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
}
