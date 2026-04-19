import { join } from 'path';
import { fileExists, findFiles } from '../utils/file-system.js';
import { DetectionResult, DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const results: DetectionResult[] = [];

  // GitHub Actions
  const githubActionsPath = join(projectRoot, '.github/workflows');
  if (await fileExists(githubActionsPath)) {
    try {
      const workflowFiles = await findFiles('*.yml', githubActionsPath);
      const yamlFiles = await findFiles('*.yaml', githubActionsPath);
      const totalFiles = workflowFiles.length + yamlFiles.length;

      if (totalFiles > 0) {
        results.push({
          stack: 'github-actions',
          confidence: 0.9,
          evidence: [
            'Found .github/workflows directory',
            `Found ${totalFiles} workflow file(s)`,
          ],
        });
      }
    } catch {
      // Ignore errors
    }
  }

  // GitLab CI
  const gitlabCiPath = join(projectRoot, '.gitlab-ci.yml');
  if (await fileExists(gitlabCiPath)) {
    results.push({
      stack: 'gitlab-ci',
      confidence: 0.9,
      evidence: ['Found .gitlab-ci.yml'],
    });
  }

  // CircleCI
  const circleCiPath = join(projectRoot, '.circleci/config.yml');
  if (await fileExists(circleCiPath)) {
    results.push({
      stack: 'circleci',
      confidence: 0.9,
      evidence: ['Found .circleci/config.yml'],
    });
  }

  // Jenkins
  const jenkinsfilePath = join(projectRoot, 'Jenkinsfile');
  if (await fileExists(jenkinsfilePath)) {
    results.push({
      stack: 'jenkins',
      confidence: 0.8,
      evidence: ['Found Jenkinsfile'],
    });
  }

  // Travis CI
  const travisCiPath = join(projectRoot, '.travis.yml');
  if (await fileExists(travisCiPath)) {
    results.push({
      stack: 'travis-ci',
      confidence: 0.9,
      evidence: ['Found .travis.yml'],
    });
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
};
