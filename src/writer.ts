import { writeFile, appendFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { FileSystemError } from './utils/errors.js';

export async function writeFiles(
  files: { write: Record<string, string>; append: Record<string, string> },
  projectRoot: string,
  outputDir: string,
  claudeMdAppendTarget?: string
): Promise<void> {
  const outputPath = join(projectRoot, outputDir);

  for (const [relativePath, content] of Object.entries(files.write)) {
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

  for (const [relativePath, content] of Object.entries(files.append)) {
    const fullPath =
      relativePath === 'CLAUDE.md' && claudeMdAppendTarget
        ? claudeMdAppendTarget
        : join(outputPath, relativePath);
    const dir = dirname(fullPath);

    try {
      await mkdir(dir, { recursive: true });
      await appendFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new FileSystemError(
        `Failed to append to file: ${relativePath}. ${(error as Error).message}`,
        fullPath
      );
    }
  }
}
