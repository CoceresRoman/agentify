# Agentify

Auto-detect your project's tech stack and generate [Claude Code](https://claude.ai/claude-code) configuration files.

[![npm version](https://img.shields.io/npm/v/@coceresroman/agentify.svg)](https://www.npmjs.com/package/@coceresroman/agentify)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

Agentify scans your project, detects the tech stack, and writes `.claude/CLAUDE.md` and `.claude/skills/{stack}/SKILL.md` so Claude has context about your architecture, best practices, and common commands. If `CLAUDE.md` already exists, it appends the skills section rather than overwriting.

## Usage

```bash
npx @coceresroman/agentify init
```

| Flag | Description | Default |
|------|-------------|---------|
| `--yes`, `-y` | Skip confirmation prompts | `false` |
| `--no-interaction` | Non-interactive mode (CI/CD) | `false` |
| `--output <path>`, `-o` | Output directory | `.claude` |
| `--debug`, `-d` | Verbose logging | `false` |

## Supported stacks

| Ecosystem | Stacks |
|-----------|--------|
| Frontend | React, Vue, Angular, Next.js |
| Node.js | NestJS, Express |
| Python | Django, Flask, FastAPI |
| Java | Spring Boot |
| Infrastructure | Docker |
| CI/CD | GitHub Actions |

## Architecture

```
agentify/
├── src/
│   ├── cli.ts                   # CLI entry point
│   ├── commands/init.ts         # Init command
│   ├── detectors/               # Per-ecosystem detectors
│   │   ├── node.detector.ts
│   │   ├── python.detector.ts
│   │   ├── java.detector.ts
│   │   ├── go.detector.ts
│   │   ├── docker.detector.ts
│   │   ├── ci.detector.ts
│   │   └── index.ts             # Detector registry
│   ├── templates/
│   │   ├── claude-md/           # CLAUDE.md templates
│   │   └── skills/              # Per-stack SKILL.md templates
│   ├── analyzer.ts              # Confidence filtering (≥70% threshold)
│   ├── generator.ts             # Template rendering
│   ├── writer.ts                # File writing / appending
│   ├── prompts.ts               # Interactive prompts
│   └── utils/
├── tests/
│   ├── unit/
│   └── integration/
└── bin/
```

Detection pipeline: `detectors` → `analyzer` (confidence filter) → `generator` (Handlebars templates) → `writer` (fs output).

## Contributing

### Adding a detector

1. Create `src/detectors/my-framework.detector.ts`:

```typescript
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot) => {
  const hasIndicator = await checkForIndicator(projectRoot);
  if (!hasIndicator) return null;

  return {
    stack: 'my-framework',
    confidence: 0.8,
    evidence: ['Found indicator X', 'Found indicator Y'],
    metadata: { version: '1.0.0' }
  };
};
```

2. Register in `src/detectors/index.ts`
3. Add a skill template at `src/templates/skills/my-framework/SKILL.md.hbs`
4. Add tests in `tests/unit/detectors/my-framework.detector.test.ts`

### Development setup

```bash
git clone https://github.com/coceresroman/agentify.git
cd agentify
npm install
npm run build
npm test
```

### Guidelines

- Write tests for every new detector
- Keep confidence scoring consistent with existing detectors
- Skill templates should include best practices, common commands, and patterns

## License

[GPL-2.0](LICENSE)
