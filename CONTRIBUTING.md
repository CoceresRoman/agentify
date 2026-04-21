# Contributing to Agentify

## Ways to contribute

- Add support for new technology stacks (detectors + skill templates)
- Report bugs via [GitHub Issues](https://github.com/coceresroman/agentify/issues)
- Suggest features with a clear use case

## Development setup

```bash
git clone https://github.com/YOUR_USERNAME/agentify.git
cd agentify
npm install
npm run build
npm test
npm link   # for local testing
```

## Adding a detector

### 1. Create detector — `src/detectors/my-framework.detector.ts`

```typescript
import { join } from 'path';
import { fileExists, readJSON } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  const configPath = join(projectRoot, 'framework.config.js');
  if (!(await fileExists(configPath))) return null;

  const evidence: string[] = ['Found framework.config.js'];
  let confidence = 0.7;

  return { stack: 'my-framework', confidence, evidence };
};
```

### 2. Register — `src/detectors/index.ts`

```typescript
import { detect as detectMyFramework } from './my-framework.detector.js';

const detectors: DetectorFunction[] = [
  // ...
  detectMyFramework,
];
```

### 3. Skill template — `src/templates/skills/my-framework/SKILL.md.hbs`

```handlebars
# My Framework Skill

## Detected Configuration
{{#each evidence}}
- {{this}}
{{/each}}

## Best Practices
...

## Common Commands
\```bash
npm test
\```
```

### 4. Add to constants — `src/constants.ts`

Add `'my-framework'` to `AVAILABLE_SKILL_STACKS`.

### 5. Tests — `tests/unit/detectors/my-framework.detector.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { detect } from '../../../src/detectors/my-framework.detector.js';

describe('my-framework.detector', () => {
  it('should detect My Framework', async () => {
    const result = await detect('/path/to/fixture');
    expect(result).not.toBeNull();
    expect(result!.stack).toBe('my-framework');
    expect(result!.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should return null for non-framework projects', async () => {
    const result = await detect('/path/to/empty');
    expect(result).toBeNull();
  });
});
```

### 6. Update README

Add the new stack to the supported stacks table in `README.md`.

## Coding guidelines

- Strict TypeScript — no `any`, explicit types
- 2 spaces indentation, single quotes
- Files: `kebab-case.ts` | Classes: `PascalCase` | Functions: `camelCase` | Constants: `UPPER_SNAKE_CASE`
- Keep detectors focused — one stack per file

## Pull request process

1. Branch from `main`: `git checkout -b feature/add-my-framework-detector`
2. Make changes following the guidelines above
3. Verify: `npm test && npm run typecheck && npm run build`
4. Submit PR with a clear title and description of what was added

### PR checklist

- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] New detector has unit tests
- [ ] Skill template covers best practices and common commands
- [ ] README updated with new stack

## License

Contributions are licensed under GPL-2.0.
