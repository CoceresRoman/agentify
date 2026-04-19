import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const evidence: string[] = [];
  let confidence = 0;

  // go.mod file
  const goModPath = join(projectRoot, 'go.mod');
  if (await fileExists(goModPath)) {
    evidence.push('Found go.mod file');
    confidence += 0.7;

    const content = await readFile(goModPath);
    if (content) {
      // Detect Gin framework
      if (content.includes('github.com/gin-gonic/gin')) {
        evidence.push('Found Gin framework');
        confidence += 0.2;

        return {
          stack: 'gin',
          confidence: Math.min(confidence, 1.0),
          evidence,
        };
      }

      // Detect Echo framework
      if (content.includes('github.com/labstack/echo')) {
        evidence.push('Found Echo framework');
        confidence += 0.2;

        return {
          stack: 'echo',
          confidence: Math.min(confidence, 1.0),
          evidence,
        };
      }

      // Detect Fiber framework
      if (content.includes('github.com/gofiber/fiber')) {
        evidence.push('Found Fiber framework');
        confidence += 0.2;

        return {
          stack: 'fiber',
          confidence: Math.min(confidence, 1.0),
          evidence,
        };
      }
    }
  }

  // go.sum file
  const goSumPath = join(projectRoot, 'go.sum');
  if (await fileExists(goSumPath)) {
    evidence.push('Found go.sum file');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'go',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
};
