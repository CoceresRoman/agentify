import { describe, it, expect } from 'vitest';
import { generateFiles } from '../../src/generator.js';
import { DetectionResult } from '../../src/types/index.js';

describe('generator', () => {
  it('should generate CLAUDE.md with stack context', async () => {
    const stacks: DetectionResult[] = [
      {
        stack: 'nestjs',
        confidence: 0.9,
        evidence: ['test'],
        metadata: { version: '10.0.0' },
      },
    ];

    const files = await generateFiles(stacks, '/test/project');

    expect(files).toHaveProperty('CLAUDE.md');
    expect(files['CLAUDE.md']).toContain('nestjs');
    expect(files['CLAUDE.md']).toContain('Project Overview');
  });

  it('should generate skill files for each stack', async () => {
    const stacks: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
      { stack: 'express', confidence: 0.8, evidence: ['test'] },
    ];

    const files = await generateFiles(stacks, '/test/project');

    expect(files).toHaveProperty('skills/nestjs/SKILL.md');
    expect(files).toHaveProperty('skills/express/SKILL.md');
  });

  it('should include metadata in skill files', async () => {
    const stacks: DetectionResult[] = [
      {
        stack: 'nextjs',
        confidence: 0.9,
        evidence: ['Found Next.js'],
        metadata: { version: '14.0.0', appDir: true },
      },
    ];

    const files = await generateFiles(stacks, '/test/project');

    expect(files['skills/nextjs/SKILL.md']).toContain('14.0.0');
    expect(files['skills/nextjs/SKILL.md']).toContain('Found Next.js');
  });

  it('should handle multiple stacks in CLAUDE.md', async () => {
    const stacks: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
      { stack: 'nextjs', confidence: 0.8, evidence: ['test'] },
    ];

    const files = await generateFiles(stacks, '/test/project');

    expect(files['CLAUDE.md']).toContain('nestjs');
    expect(files['CLAUDE.md']).toContain('nextjs');
  });
});
