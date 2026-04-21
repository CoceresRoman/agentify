import { join } from 'path';
import { readdir } from 'fs/promises';
import { readJSON, fileExists } from './utils/file-system.js';

type PackageJson = {
  scripts?: Record<string, string>;
  main?: string;
};

export type ProjectStructure = {
  scripts: Array<{ name: string; command: string }>;
  srcDirs: string[];
  testDir: string | null;
  hasTypeScript: boolean;
  hasEslint: boolean;
  configFiles: string[];
  packageName: string | null;
};

export async function scanStructure(
  projectRoot: string,
  stack: string
): Promise<ProjectStructure> {
  const [scripts, packageName] = await scanPackageJson(projectRoot);
  const srcDirs = await scanSrcDirs(projectRoot, stack);
  const testDir = await findTestDir(projectRoot);
  const configFiles = await findConfigFiles(projectRoot);
  const hasTypeScript = await fileExists(join(projectRoot, 'tsconfig.json'));
  const hasEslint =
    (await fileExists(join(projectRoot, '.eslintrc.js'))) ||
    (await fileExists(join(projectRoot, '.eslintrc.json'))) ||
    (await fileExists(join(projectRoot, 'eslint.config.js')));

  return {
    scripts,
    srcDirs,
    testDir,
    hasTypeScript,
    hasEslint,
    configFiles,
    packageName,
  };
}

async function scanPackageJson(
  projectRoot: string
): Promise<[Array<{ name: string; command: string }>, string | null]> {
  const pkg = await readJSON<PackageJson & { name?: string }>(
    join(projectRoot, 'package.json')
  );
  if (!pkg) return [[], null];

  const scripts = Object.entries(pkg.scripts ?? {})
    .filter(([name]) => !name.startsWith('pre') && !name.startsWith('post'))
    .map(([name, command]) => ({ name, command }));

  return [scripts, pkg.name ?? null];
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'target', 'coverage',
  '.next', '.nuxt', '.cache', '.turbo', 'vendor', '__pycache__', '.venv',
  'venv', 'env', '.env', '.idea', '.vscode', 'tmp', 'temp', '.gradle',
]);

async function scanSrcDirs(
  projectRoot: string,
  stack: string
): Promise<string[]> {
  if (stack === 'java' || stack === 'spring-boot') {
    return scanJavaDirs(projectRoot, 'java');
  }
  if (stack === 'kotlin') {
    return scanJavaDirs(projectRoot, 'kotlin');
  }

  return scanProjectDirs(projectRoot);
}

async function scanProjectDirs(projectRoot: string): Promise<string[]> {
  const result: string[] = [];

  try {
    const rootEntries = await readdir(projectRoot, { withFileTypes: true });
    const topDirs = rootEntries
      .filter((e) => e.isDirectory() && !IGNORED_DIRS.has(e.name) && !e.name.startsWith('.'))
      .map((e) => e.name);

    for (const dir of topDirs) {
      result.push(`${dir}/`);
      try {
        const subEntries = await readdir(join(projectRoot, dir), { withFileTypes: true });
        const subDirs = subEntries
          .filter((e) => e.isDirectory() && !IGNORED_DIRS.has(e.name) && !e.name.startsWith('.'))
          .map((e) => `  ${dir}/${e.name}/`);
        result.push(...subDirs);
      } catch {
        // skip unreadable subdirs
      }
    }
  } catch {
    // skip if root unreadable
  }

  return result;
}

async function scanJavaDirs(
  projectRoot: string,
  lang: 'java' | 'kotlin'
): Promise<string[]> {
  const basePath = join(projectRoot, 'src', 'main', lang);
  try {
    const entries = await readdir(basePath, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => `src/main/${lang}/${e.name}/`);
    return dirs.length > 0 ? dirs : await scanProjectDirs(projectRoot);
  } catch {
    return scanProjectDirs(projectRoot);
  }
}

async function findTestDir(projectRoot: string): Promise<string | null> {
  const candidates = ['test', 'tests', '__tests__', 'spec', 'src/test'];
  for (const candidate of candidates) {
    if (await fileExists(join(projectRoot, candidate))) return candidate;
  }
  return null;
}

async function findConfigFiles(projectRoot: string): Promise<string[]> {
  const candidates = [
    'nest-cli.json',
    'angular.json',
    'vue.config.js',
    'vite.config.ts',
    'vite.config.js',
    'webpack.config.js',
    'jest.config.ts',
    'jest.config.js',
    'vitest.config.ts',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.env.example',
  ];

  const found: string[] = [];
  for (const file of candidates) {
    if (await fileExists(join(projectRoot, file))) found.push(file);
  }
  return found;
}
