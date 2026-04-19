import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const evidence: string[] = [];
  let confidence = 0;

  const dockerfilePath = join(projectRoot, 'Dockerfile');
  const dockerComposePathYml = join(projectRoot, 'docker-compose.yml');
  const dockerComposePathYaml = join(projectRoot, 'docker-compose.yaml');
  const dockerignorePath = join(projectRoot, '.dockerignore');

  if (await fileExists(dockerfilePath)) {
    evidence.push('Found Dockerfile');
    confidence += 0.6;

    const content = await readFile(dockerfilePath);
    if (content) {
      if (content.includes('FROM')) {
        evidence.push('Valid Dockerfile with FROM instruction');
        confidence += 0.2;
      }
    }
  }

  if (
    (await fileExists(dockerComposePathYml)) ||
    (await fileExists(dockerComposePathYaml))
  ) {
    evidence.push('Found docker-compose.yml');
    confidence += 0.3;
  }

  if (await fileExists(dockerignorePath)) {
    evidence.push('Found .dockerignore');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'docker',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
};
