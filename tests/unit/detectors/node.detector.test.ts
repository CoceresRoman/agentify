import { describe, it, expect } from 'vitest';
import { detect } from '../../../src/detectors/node.detector.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../../fixtures');

describe('node.detector', () => {
  describe('NestJS detection', () => {
    it('should detect NestJS with high confidence', async () => {
      const projectRoot = join(fixturesPath, 'nestjs-project');
      const result = await detect(projectRoot);

      expect(result).not.toBeNull();
      expect(result!.stack).toBe('nestjs');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result!.evidence).toContain('Found @nestjs/core in dependencies');
    });

    it('should extract NestJS version', async () => {
      const projectRoot = join(fixturesPath, 'nestjs-project');
      const result = await detect(projectRoot);

      expect(result!.metadata?.version).toBeDefined();
    });
  });

  describe('Express detection', () => {
    it('should detect Express with moderate confidence', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);

      expect(result).not.toBeNull();
      expect(result!.stack).toBe('express');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.6);
    });

    it('should boost confidence with middleware detection', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);

      expect(result!.confidence).toBeGreaterThan(0.7);
      expect(result!.evidence.some((e) => e.includes('middleware'))).toBe(true);
    });

    it('should detect TypeScript usage', async () => {
      const projectRoot = join(fixturesPath, 'express-project');
      const result = await detect(projectRoot);

      expect(result!.metadata?.typescript).toBe(true);
    });
  });

  describe('Next.js detection', () => {
    it('should detect Next.js with high confidence', async () => {
      const projectRoot = join(fixturesPath, 'nextjs-project');
      const result = await detect(projectRoot);

      expect(result).not.toBeNull();
      expect(result!.stack).toBe('nextjs');
      expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should detect App Router support', async () => {
      const projectRoot = join(fixturesPath, 'nextjs-project');
      const result = await detect(projectRoot);

      expect(result!.metadata?.appDir).toBe(true);
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
