export const CONFIDENCE_THRESHOLD = 0.7;

export const AVAILABLE_SKILL_STACKS = [
  'angular',
  'django',
  'docker',
  'express',
  'fastapi',
  'flask',
  'github-actions',
  'nestjs',
  'nextjs',
  'react',
  'spring-boot',
  'vue',
] as const;

export const OUTPUT_DIR = '.claude';

export const SUPPORTED_STACKS = {
  // Node.js Frameworks
  NESTJS: 'nestjs',
  EXPRESS: 'express',
  NEXTJS: 'nextjs',
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',
  FASTIFY: 'fastify',
  KOA: 'koa',
  REMIX: 'remix',

  // Python Frameworks
  DJANGO: 'django',
  FLASK: 'flask',
  FASTAPI: 'fastapi',

  // Java
  SPRING_BOOT: 'spring-boot',
  MAVEN: 'maven',
  GRADLE: 'gradle',

  // Go
  GO: 'go',
  GIN: 'gin',
  ECHO: 'echo',
  FIBER: 'fiber',

  // Infrastructure
  DOCKER: 'docker',

  // CI/CD
  GITHUB_ACTIONS: 'github-actions',
  GITLAB_CI: 'gitlab-ci',
  CIRCLECI: 'circleci',
  JENKINS: 'jenkins',
  TRAVIS_CI: 'travis-ci',
} as const;
