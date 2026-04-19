import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { FileSystemError } from './utils/errors.js';

export async function writeFiles(
  files: Record<string, string>,
  projectRoot: string,
  outputDir: string
): Promise<void> {
  const outputPath = join(projectRoot, outputDir);

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(outputPath, relativePath);
    const dir = dirname(fullPath);

    try {
      await mkdir(dir, { recursive: true });
      await writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new FileSystemError(
        `Failed to write file: ${relativePath}. ${(error as Error).message}`,
        fullPath
      );
    }
  }
}
