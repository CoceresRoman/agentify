import { join } from 'path';
import { fileExists, readJSON } from '../utils/file-system.js';
import { DetectionResult, DetectorFunction } from '../types/index.js';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
  scripts?: Record<string, string>;
};

export const detect: DetectorFunction = async (projectRoot: string) => {
  const packageJsonPath = join(projectRoot, 'package.json');

  if (!(await fileExists(packageJsonPath))) {
    return null;
  }

  const pkg = await readJSON<PackageJson>(packageJsonPath);
  if (!pkg) {
    return null;
  }

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const results: DetectionResult[] = [];

  const nestjsResult = detectNestJS(allDeps);
  if (nestjsResult) results.push(nestjsResult);

  const expressResult = detectExpress(allDeps);
  if (expressResult) results.push(expressResult);

  const nextjsResult = detectNextJS(allDeps, pkg);
  if (nextjsResult) results.push(nextjsResult);

  const reactResult = detectReact(allDeps);
  if (reactResult) results.push(reactResult);

  const vueResult = detectVue(allDeps);
  if (vueResult) results.push(vueResult);

  const angularResult = detectAngular(allDeps);
  if (angularResult) results.push(angularResult);

  const fastifyResult = detectFastify(allDeps);
  if (fastifyResult) results.push(fastifyResult);

  const koaResult = detectKoa(allDeps);
  if (koaResult) results.push(koaResult);

  const remixResult = detectRemix(allDeps);
  if (remixResult) results.push(remixResult);

  if (results.length === 0) return null;

  return results;
};

function detectNestJS(
  deps: Record<string, string>
): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['@nestjs/core']) {
    evidence.push('Found @nestjs/core in dependencies');
    confidence += 0.5;
  }

  if (deps['@nestjs/common']) {
    evidence.push('Found @nestjs/common in dependencies');
    confidence += 0.3;
  }

  if (deps['@nestjs/platform-express'] || deps['@nestjs/platform-fastify']) {
    evidence.push('Found NestJS platform adapter');
    confidence += 0.2;
  }

  if (confidence === 0) return null;

  return {
    stack: 'nestjs',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['@nestjs/core']?.replace(/[\^~]/, ''),
    },
  };
}

function detectExpress(
  deps: Record<string, string>
): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['express']) {
    evidence.push('Found express in dependencies');
    confidence += 0.6;
  }

  const expressMiddleware = [
    'body-parser',
    'cors',
    'morgan',
    'express-validator',
    'helmet',
  ];
  const foundMiddleware = expressMiddleware.filter((m) => deps[m]);

  if (foundMiddleware.length > 0) {
    evidence.push(`Found Express middleware: ${foundMiddleware.join(', ')}`);
    confidence += foundMiddleware.length * 0.1;
  }

  if (deps['@types/express']) {
    evidence.push('Found @types/express (TypeScript project)');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'express',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['express']?.replace(/[\^~]/, ''),
      typescript: !!deps['@types/express'],
    },
  };
}

function detectNextJS(
  deps: Record<string, string>,
  pkg: PackageJson
): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['next']) {
    evidence.push('Found next in dependencies');
    confidence += 0.7;
  }

  if (deps['react'] && deps['next']) {
    evidence.push('Found React + Next.js combination');
    confidence += 0.2;
  }

  if (
    pkg.scripts?.['dev']?.includes('next') ||
    pkg.scripts?.['build']?.includes('next')
  ) {
    evidence.push('Found Next.js scripts in package.json');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  const version = deps['next']?.replace(/[\^~]/, '');
  const majorVersion = version ? parseInt(version.split('.')[0], 10) : 0;

  return {
    stack: 'nextjs',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version,
      appDir: majorVersion >= 13,
    },
  };
}

function detectReact(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  // Only detect React if it's NOT Next.js (Next.js already includes React)
  if (deps['react'] && !deps['next']) {
    evidence.push('Found React in dependencies');
    confidence += 0.7;
  }

  if (deps['react-dom'] && !deps['next']) {
    evidence.push('Found ReactDOM');
    confidence += 0.2;
  }

  if (deps['react-router-dom']) {
    evidence.push('Found React Router');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'react',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['react']?.replace(/[\^~]/, ''),
    },
  };
}

function detectVue(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['vue']) {
    evidence.push('Found Vue in dependencies');
    confidence += 0.7;
  }

  if (deps['vue-router']) {
    evidence.push('Found Vue Router');
    confidence += 0.2;
  }

  if (deps['vuex'] || deps['pinia']) {
    evidence.push('Found state management (Vuex/Pinia)');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  const version = deps['vue']?.replace(/[\^~]/, '');
  const majorVersion = version ? parseInt(version.split('.')[0], 10) : 0;

  return {
    stack: 'vue',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version,
      vue3: majorVersion >= 3,
    },
  };
}

function detectAngular(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['@angular/core']) {
    evidence.push('Found @angular/core in dependencies');
    confidence += 0.7;
  }

  if (deps['@angular/common']) {
    evidence.push('Found @angular/common');
    confidence += 0.2;
  }

  if (deps['@angular/router']) {
    evidence.push('Found Angular Router');
    confidence += 0.1;
  }

  if (confidence === 0) return null;

  return {
    stack: 'angular',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['@angular/core']?.replace(/[\^~]/, ''),
    },
  };
}

function detectFastify(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['fastify']) {
    evidence.push('Found Fastify in dependencies');
    confidence += 0.7;
  }

  const fastifyPlugins = Object.keys(deps).filter((dep) =>
    dep.startsWith('@fastify/')
  );

  if (fastifyPlugins.length > 0) {
    evidence.push(`Found ${fastifyPlugins.length} Fastify plugin(s)`);
    confidence += 0.2;
  }

  if (confidence === 0) return null;

  return {
    stack: 'fastify',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['fastify']?.replace(/[\^~]/, ''),
    },
  };
}

function detectKoa(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['koa']) {
    evidence.push('Found Koa in dependencies');
    confidence += 0.7;
  }

  const koaMiddleware = ['koa-router', 'koa-bodyparser', '@koa/router'];
  const foundMiddleware = koaMiddleware.filter((m) => deps[m]);

  if (foundMiddleware.length > 0) {
    evidence.push(`Found Koa middleware: ${foundMiddleware.join(', ')}`);
    confidence += 0.2;
  }

  if (confidence === 0) return null;

  return {
    stack: 'koa',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['koa']?.replace(/[\^~]/, ''),
    },
  };
}

function detectRemix(deps: Record<string, string>): DetectionResult | null {
  const evidence: string[] = [];
  let confidence = 0;

  if (deps['@remix-run/react']) {
    evidence.push('Found Remix in dependencies');
    confidence += 0.7;
  }

  if (deps['@remix-run/node'] || deps['@remix-run/cloudflare']) {
    evidence.push('Found Remix runtime');
    confidence += 0.2;
  }

  if (confidence === 0) return null;

  return {
    stack: 'remix',
    confidence: Math.min(confidence, 1.0),
    evidence,
    metadata: {
      version: deps['@remix-run/react']?.replace(/[\^~]/, ''),
    },
  };
}
