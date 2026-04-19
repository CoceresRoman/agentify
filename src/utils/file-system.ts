import { access, readFile as fsReadFile } from 'fs/promises';
import { glob as globSync } from 'glob';
import { FileSystemError } from './errors.js';

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON<T>(path: string): Promise<T | null> {
  try {
    const content = await fsReadFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new FileSystemError(`Invalid JSON in file: ${path}`, path);
    }
    return null;
  }
}

export async function readFile(path: string): Promise<string | null> {
  try {
    return await fsReadFile(path, 'utf-8');
  } catch {
    return null;
  }
}

export async function findFiles(
  pattern: string,
  cwd: string
): Promise<string[]> {
  try {
    return await globSync(pattern, { cwd });
  } catch (error) {
    throw new FileSystemError(
      `Failed to find files with pattern: ${pattern}`,
      cwd
    );
  }
}
