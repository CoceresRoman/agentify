import { join } from 'path';
import { fileExists, readFile } from '../utils/file-system.js';
import { DetectionResult, DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const results: DetectionResult[] = [];

  // Check requirements.txt
  const requirementsPath = join(projectRoot, 'requirements.txt');
  if (await fileExists(requirementsPath)) {
    const content = await readFile(requirementsPath);
    if (content) {
      const djangoResult = detectDjango(content);
      if (djangoResult) results.push(djangoResult);

      const flaskResult = detectFlask(content);
      if (flaskResult) results.push(flaskResult);

      const fastapiResult = detectFastAPI(content);
      if (fastapiResult) results.push(fastapiResult);
    }
  }

  // Check pyproject.toml
  const pyprojectPath = join(projectRoot, 'pyproject.toml');
  if (await fileExists(pyprojectPath)) {
    const content = await readFile(pyprojectPath);
    if (content) {
      if (!results.some((r) => r.stack === 'django')) {
        const djangoResult = detectDjango(content);
        if (djangoResult) results.push(djangoResult);
      }

      if (!results.some((r) => r.stack === 'flask')) {
        const flaskResult = detectFlask(content);
        if (flaskResult) results.push(flaskResult);
      }

      if (!results.some((r) => r.stack === 'fastapi')) {
        const fastapiResult = detectFastAPI(content);
        if (fastapiResult) results.push(fastapiResult);
      }
    }
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
};

function detectDjango(content: string): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (content.match(/django[>=<\s]/i)) {
    evidence.push('Found Django in dependencies');
    confidence += 0.7;
  }

  if (content.includes('djangorestframework')) {
    evidence.push('Found Django REST Framework');
    confidence += 0.2;
  }

  if (content.includes('django-')) {
    evidence.push('Found Django plugins');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'django',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
}

function detectFlask(content: string): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (content.match(/flask[>=<\s]/i)) {
    evidence.push('Found Flask in dependencies');
    confidence += 0.7;
  }

  if (content.includes('flask-')) {
    evidence.push('Found Flask extensions');
    confidence += 0.2;
  }

  if (confidence === 0) return null;

  return {
    stack: 'flask',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
}

function detectFastAPI(content: string): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (content.match(/fastapi[>=<\s]/i)) {
    evidence.push('Found FastAPI in dependencies');
    confidence += 0.7;
  }

  if (content.includes('uvicorn')) {
    evidence.push('Found Uvicorn (FastAPI server)');
    confidence += 0.2;
  }

  if (content.includes('pydantic')) {
    evidence.push('Found Pydantic (FastAPI validation)');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'fastapi',
    confidence: Math.min(confidence, 1.0),
    evidence,
  };
}
