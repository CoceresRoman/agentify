import { describe, it, expect } from 'vitest';
import { generateFiles } from '../../src/generator.js';
import { DetectionResult } from '../../src/types/index.js';

describe('generator', () => {
  it('should generate CLAUDE.md with stack context when file does not exist', async () => {
    const stacks: DetectionResult[] = [
      {
        stack: 'nestjs',
        confidence: 0.9,
        evidence: ['test'],
        metadata: { version: '10.0.0' },
      },
    ];

    const { write } = await generateFiles(stacks, '/test/project', false);

    expect(write).toHaveProperty('CLAUDE.md');
    expect(write['CLAUDE.md']).toContain('nestjs');
    expect(write['CLAUDE.md']).toContain('Project Overview');
  });

  it('should append skills section when CLAUDE.md already exists', async () => {
    const stacks: DetectionResult[] = [
      {
        stack: 'nestjs',
        confidence: 0.9,
        evidence: ['test'],
        metadata: { version: '10.0.0' },
      },
    ];

    const { write, append } = await generateFiles(stacks, '/test/project', true);

    expect(write).not.toHaveProperty('CLAUDE.md');
    expect(append).toHaveProperty('CLAUDE.md');
    expect(append['CLAUDE.md']).toContain('nestjs');
    expect(append['CLAUDE.md']).toContain('Agentify Skills');
  });

  it('should generate skill files for each stack', async () => {
    const stacks: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
      { stack: 'express', confidence: 0.8, evidence: ['test'] },
    ];

    const { write } = await generateFiles(stacks, '/test/project');

    expect(write).toHaveProperty('skills/nestjs/SKILL.md');
    expect(write).toHaveProperty('skills/express/SKILL.md');
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

    const { write } = await generateFiles(stacks, '/test/project');

    expect(write['skills/nextjs/SKILL.md']).toContain('14.0.0');
    expect(write['skills/nextjs/SKILL.md']).toContain('Found Next.js');
  });

  it('should handle multiple stacks in CLAUDE.md', async () => {
    const stacks: DetectionResult[] = [
      { stack: 'nestjs', confidence: 0.9, evidence: ['test'] },
      { stack: 'nextjs', confidence: 0.8, evidence: ['test'] },
    ];

    const { write } = await generateFiles(stacks, '/test/project');

    expect(write['CLAUDE.md']).toContain('nestjs');
    expect(write['CLAUDE.md']).toContain('nextjs');
  });
});
