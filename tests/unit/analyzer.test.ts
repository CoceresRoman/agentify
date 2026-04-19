import { describe, it, expect } from 'vitest';
import { analyzeStack } from '../../src/analyzer.js';
import { DetectionResult } from '../../src/types/index.js';

describe('analyzer', () => {
  it('should filter out low-confidence results', async () => {
    const results: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
      { stack: 'docker', confidence: 0.5, evidence: ['test'] },
    ];

    const analyzed = await analyzeStack(results, '/test/path');

    expect(analyzed.stacks).toHaveLength(1);
    expect(analyzed.stacks[0].stack).toBe('nestjs');
  });

  it('should keep results at exactly 0.7 confidence', async () => {
    const results: DetectionResult[] = [
      { stack: 'express', confidence: 0.7, evidence: ['test'] },
    ];

    const analyzed = await analyzeStack(results, '/test/path');

    expect(analyzed.stacks).toHaveLength(1);
  });

  it('should sort by confidence descending', async () => {
    const results: DetectionResult[] = [
      { stack: 'express', confidence: 0.75, evidence: ['test'] },
      { stack: 'nestjs', confidence: 0.95, evidence: ['test'] },
      { stack: 'nextjs', confidence: 0.80, evidence: ['test'] },
    ];

    const analyzed = await analyzeStack(results, '/test/path');

    expect(analyzed.stacks[0].stack).toBe('nestjs');
    expect(analyzed.stacks[1].stack).toBe('nextjs');
    expect(analyzed.stacks[2].stack).toBe('express');
  });

  it('should include timestamp and projectRoot', async () => {
    const results: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
    ];

    const analyzed = await analyzeStack(results, '/test/path');

    expect(analyzed.projectRoot).toBe('/test/path');
    expect(analyzed.timestamp).toBeInstanceOf(Date);
  });
});
