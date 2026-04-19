# Contributing to Agentify

Thank you for your interest in contributing to Agentify! This document provides guidelines for contributing to the project.

## 🎯 How Can I Contribute?

### Adding New Detectors

The easiest way to contribute is by adding support for new technology stacks:

1. **Create a new detector** in `src/detectors/`
2. **Add tests** for your detector
3. **Create a skill template** in `src/templates/skills/`
4. **Update documentation**

### Reporting Bugs

If you find a bug:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, OS)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues first
2. Describe the use case
3. Explain why it would be useful

## 🛠️ Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/agentify.git
cd agentify

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Link for local testing
npm link
```

## 📝 Coding Guidelines

### TypeScript

- Use strict TypeScript mode
- Add proper type annotations
- Avoid `any` types
- Use interfaces for object shapes

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Naming Conventions

- **Files**: kebab-case (e.g., `node.detector.ts`)
- **Classes**: PascalCase (e.g., `DetectorRegistry`)
- **Functions**: camelCase (e.g., `detectNestJS`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CONFIDENCE_THRESHOLD`)

## 🧪 Testing

All new code should include tests:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck
```

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('MyDetector', () => {
  it('should detect framework X', async () => {
    // Arrange
    const projectRoot = '/path/to/test/project';

    // Act
    const result = await detect(projectRoot);

    // Assert
    expect(result).not.toBeNull();
    expect(result.stack).toBe('framework-x');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });
});
```

## 📚 Adding a New Detector

### Step 1: Create Detector File

Create `src/detectors/my-framework.detector.ts`:

```typescript
import { join } from 'path';
import { fileExists, readJSON } from '../utils/file-system.js';
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot: string) => {
  // Check for framework indicators
  const configPath = join(projectRoot, 'framework.config.js');

  if (!(await fileExists(configPath))) {
    return null;
  }

  // Build evidence and calculate confidence
  const evidence: string[] = ['Found framework.config.js'];
  let confidence = 0.7;

  // Add more detection logic...

  return {
    stack: 'my-framework',
    confidence,
    evidence,
    metadata: {
      // Optional metadata
    }
  };
};
```

### Step 2: Register Detector

Add to `src/detectors/index.ts`:

```typescript
import { detect as detectMyFramework } from './my-framework.detector.js';

const detectors: DetectorFunction[] = [
  // ... existing detectors
  detectMyFramework,
];
```

### Step 3: Create Skill Template

Create `src/templates/skills/my-framework/SKILL.md.hbs`:

```handlebars
# My Framework Development Skill

## Overview
This skill provides context for My Framework development.

## Detected Configuration
{{#each evidence}}
- {{this}}
{{/each}}

## Best Practices

1. **Practice 1**: Description
2. **Practice 2**: Description

## Common Patterns

### Pattern Example
\```javascript
// Code example
\```

## Testing

\```bash
npm test
\```
```

### Step 4: Add Tests

Create `tests/unit/detectors/my-framework.detector.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { detect } from '../../../src/detectors/my-framework.detector.js';

describe('my-framework.detector', () => {
  it('should detect My Framework', async () => {
    const result = await detect('/path/to/fixture');
    expect(result).not.toBeNull();
    expect(result!.stack).toBe('my-framework');
  });

  it('should return null for non-framework projects', async () => {
    const result = await detect('/path/to/empty');
    expect(result).toBeNull();
  });
});
```

### Step 5: Create Test Fixtures

Create test fixtures in `tests/fixtures/my-framework-project/`:

```
tests/fixtures/my-framework-project/
├── framework.config.js
└── package.json
```

### Step 6: Update Documentation

Update:
- `README.md` - Add to supported stacks list
- `src/constants.ts` - Add constant if needed

## 🔄 Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/add-my-framework-detector
   ```

2. **Make your changes** following the guidelines above

3. **Run tests**:
   ```bash
   npm test
   npm run typecheck
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add detector for My Framework"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/add-my-framework-detector
   ```

6. **Create a Pull Request** with:
   - Clear title describing the change
   - Description of what was added/changed
   - Link to any related issues
   - Screenshots/examples if applicable

## ✅ PR Checklist

Before submitting your PR, make sure:

- [ ] Code follows the style guidelines
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive

## 🤔 Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new issue with the `question` label
3. Reach out on GitHub Discussions

## 📜 Code of Conduct

Be respectful and constructive in all interactions. We're here to build something useful together!

## 📄 License

By contributing, you agree that your contributions will be licensed under the GPL-2.0 License.

---

Thank you for contributing to Agentify! 🎉
