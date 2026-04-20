import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'path';
import { rm, readFile, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runAllDetectors } from '../../src/detectors/index.js';
import { analyzeStack } from '../../src/analyzer.js';
import { generateFiles } from '../../src/generator.js';
import { writeFiles } from '../../src/writer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesPath = join(__dirname, '../fixtures');

describe('agentify init (integration)', () => {
  const testProjectPath = join(fixturesPath, 'nestjs-project');
  const claudeDir = join(testProjectPath, '.claude');

  afterEach(async () => {
    try {
      await rm(claudeDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  });

  it('should generate .claude/ directory with files for NestJS project', async () => {
    const detectionResults = await runAllDetectors(testProjectPath);
    const analyzed = await analyzeStack(detectionResults, testProjectPath);
    const files = await generateFiles(analyzed.stacks, testProjectPath, false);
    await writeFiles(files, testProjectPath, '.claude');

    const claudeMdPath = join(claudeDir, 'CLAUDE.md');
    const skillMdPath = join(claudeDir, 'skills/nestjs/SKILL.md');

    await access(claudeMdPath);
    await access(skillMdPath);

    const claudeMd = await readFile(claudeMdPath, 'utf-8');
    const skillMd = await readFile(skillMdPath, 'utf-8');

    expect(claudeMd).toContain('Project Overview');
    expect(claudeMd).toContain('nestjs');
    expect(skillMd).toContain('NestJS Development Skill');
  });

  it('should append skills section when CLAUDE.md already exists', async () => {
    const claudeMdPath = join(claudeDir, 'CLAUDE.md');
    const detectionResults = await runAllDetectors(testProjectPath);
    const analyzed = await analyzeStack(detectionResults, testProjectPath);

    // First run: create CLAUDE.md
    const firstRun = await generateFiles(analyzed.stacks, testProjectPath, false);
    await writeFiles(firstRun, testProjectPath, '.claude');

    // Second run: append skills section
    const secondRun = await generateFiles(analyzed.stacks, testProjectPath, true);
    await writeFiles(secondRun, testProjectPath, '.claude');

    const claudeMd = await readFile(claudeMdPath, 'utf-8');
    expect(claudeMd).toContain('Project Overview');
    expect(claudeMd).toContain('Agentify Skills');
    expect(claudeMd).toContain('nestjs');
  });

  it('should respect custom output directory', async () => {
    const customDir = join(testProjectPath, 'custom-output');
    const detectionResults = await runAllDetectors(testProjectPath);
    const analyzed = await analyzeStack(detectionResults, testProjectPath);
    const files = await generateFiles(analyzed.stacks, testProjectPath, false);
    await writeFiles(files, testProjectPath, 'custom-output');

    const claudeMdPath = join(customDir, 'CLAUDE.md');

    await access(claudeMdPath);
    const claudeMd = await readFile(claudeMdPath, 'utf-8');
    expect(claudeMd).toBeDefined();

    await rm(customDir, { recursive: true });
  });

  it('should detect Express project correctly', async () => {
    const expressProjectPath = join(fixturesPath, 'express-project');
    const detectionResults = await runAllDetectors(expressProjectPath);
    const analyzed = await analyzeStack(detectionResults, expressProjectPath);

    expect(analyzed.stacks.length).toBeGreaterThan(0);
    expect(analyzed.stacks[0].stack).toBe('express');
  });

  it('should detect Next.js project correctly', async () => {
    const nextjsProjectPath = join(fixturesPath, 'nextjs-project');
    const detectionResults = await runAllDetectors(nextjsProjectPath);
    const analyzed = await analyzeStack(detectionResults, nextjsProjectPath);

    expect(analyzed.stacks.length).toBeGreaterThan(0);
    expect(analyzed.stacks[0].stack).toBe('nextjs');
  });

  it('should handle empty project without errors', async () => {
    const emptyProjectPath = join(fixturesPath, 'empty-project');
    const detectionResults = await runAllDetectors(emptyProjectPath);

    expect(detectionResults).toHaveLength(0);
  });
});
