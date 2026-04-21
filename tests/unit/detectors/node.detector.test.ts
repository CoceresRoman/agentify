import { describe, it, expect } from 'vitest';
import { detect } from '../../../src/detectors/node.detector.js';
import { DetectionResult } from '../../../src/types/index.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../../fixtures');

function findStack(result: DetectionResult | DetectionResult[] | null, stack: string): DetectionResult | undefined {
  if (!result) return undefined;
  if (Array.isArray(result)) return result.find((r) => r.stack === stack);
  return result.stack === stack ? result : undefined;
}

describe('node.detector', () => {
  describe('NestJS detection', () => {
    it('should detect NestJS with high confidence', async () => {
      const projectRoot = join(fixturesPath, 'nestjs-project');
      const result = await detect(projectRoot);
      const nestjs = findStack(result, 'nestjs');

      expect(nestjs).toBeDefined();
      expect(nestjs!.confidence).toBeGreaterThanOrEqual(0.7);
      expect(nestjs!.evidence).toContain('Found @nestjs/core in dependencies');
    });

    it('should extract NestJS version', async () => {
      const projectRoot = join(fixturesPath, 'nestjs-project');
      const result = await detect(projectRoot);
      const nestjs = findStack(result, 'nestjs');

      expect(nestjs!.metadata?.version).toBeDefined();
    });
  });

  describe('Express detection', () => {
    it('should detect Express with moderate confidence', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);
      const express = findStack(result, 'express');

      expect(express).toBeDefined();
      expect(express!.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should boost confidence with middleware detection', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);
      const express = findStack(result, 'express');

      expect(express!.confidence).toBeGreaterThan(0.7);
      expect(express!.evidence.some((e) => e.includes('middleware'))).toBe(true);
    });

    it('should detect TypeScript usage', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);
      const express = findStack(result, 'express');

      expect(express!.metadata?.typescript).toBe(true);
    });
  });

  describe('Next.js detection', () => {
    it('should detect Next.js with high confidence', async () => {
      const projectRoot = join(fixturesPath, 'nextjs-project');
      const result = await detect(projectRoot);
      const nextjs = findStack(result, 'nextjs');

      expect(nextjs).toBeDefined();
      expect(nextjs!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect App Router support', async () => {
      const projectRoot = join(fixturesPath, 'nextjs-project');
      const result = await detect(projectRoot);
      const nextjs = findStack(result, 'nextjs');

      expect(nextjs!.metadata?.appDir).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return null for non-Node projects', async () => {
      const projectRoot = join(fixturesPath, 'empty-project');
      const result = await detect(projectRoot);

      expect(result).toBeNull();
    });

    it('should return null for non-existent directory', async () => {
      const projectRoot = join(fixturesPath, 'non-existent');
      const result = await detect(projectRoot);

      expect(result).toBeNull();
    });
  });
});
