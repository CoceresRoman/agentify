# 🤖 Agentify

> Auto-detect your project's tech stack and generate Claude Code configuration files instantly.

[![npm version](https://img.shields.io/npm/v/@coceresroman/agentify.svg)](https://www.npmjs.com/package/@coceresroman/agentify)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)

**Agentify** is a powerful CLI tool that automatically detects your project's technology stack and generates optimized configuration files (`CLAUDE.md` and `SKILL.md`) for [Claude Code](https://claude.ai/claude-code), giving Claude context about your project's architecture, best practices, and common patterns.

## ✨ Features

- 🔍 **Smart Detection**: Automatically identifies 25+ technology stacks
- 📊 **Confidence Scoring**: 70% threshold ensures accurate detection
- 💬 **Interactive Mode**: Confirm and edit detected stacks before generating
- 📝 **Rich Documentation**: Generates comprehensive CLAUDE.md with project overview
- 🎯 **Framework Skills**: Creates SKILL.md files with best practices and patterns
- 🎨 **Template-Based**: Uses Handlebars templates for flexible generation
- ⚡ **Fast & Lightweight**: No heavy dependencies, instant results

## 🚀 Quick Start

```bash
# Run directly with npx (no installation needed)
npx @coceresroman/agentify init

# Or install globally
npm install -g @coceresroman/agentify
agentify init
```

## 📦 Installation

### Using npx (Recommended)

No installation required! Just run:

```bash
npx @coceresroman/agentify init
```

### Global Installation

```bash
npm install -g @coceresroman/agentify
```

### Local Installation

```bash
npm install --save-dev @coceresroman/agentify
```

## 🎯 Usage

### Basic Usage

```bash
# Initialize Claude Code configuration in current project
agentify init
```

### With Options

```bash
# Skip confirmation prompts
agentify init --yes

# Custom output directory
agentify init --output .ai

# Enable debug logging
agentify init --debug

# Non-interactive mode (for CI/CD)
agentify init --no-interaction
```

### Example Output

```
Analyzing project at: /home/user/my-fullstack-app

Detected stacks:
  - nextjs (90% confidence)
    • Found next in dependencies
    • Found React + Next.js combination
    • Found Next.js scripts in package.json
  - docker (80% confidence)
    • Found Dockerfile
    • Valid Dockerfile with FROM instruction
  - github-actions (90% confidence)
    • Found .github/workflows directory
    • Found 3 workflow file(s)

✓ Successfully generated Claude Code configuration in .claude/
  - CLAUDE.md
  - skills/nextjs/SKILL.md
  - skills/docker/SKILL.md
  - skills/github-actions/SKILL.md
```

## 🛠️ Supported Stacks

### Frontend (9 frameworks)
- ✅ **React** - Modern UI library with hooks
- ✅ **Vue** - Progressive JavaScript framework (Vue 2 & 3)
- ✅ **Angular** - Full-featured framework with TypeScript
- ✅ **Next.js** - React meta-framework (Pages & App Router)
- ✅ **Remix** - Full-stack React framework
- ✅ **Svelte** - Coming soon
- ✅ **Solid** - Coming soon

### Backend - Node.js (6 frameworks)
- ✅ **NestJS** - Progressive Node.js framework
- ✅ **Express** - Minimal and flexible web framework
- ✅ **Fastify** - Fast and low overhead framework
- ✅ **Koa** - Next generation web framework
- ✅ **Hapi** - Coming soon
- ✅ **AdonisJS** - Coming soon

### Backend - Python (3 frameworks)
- ✅ **Django** - High-level web framework
- ✅ **Flask** - Lightweight WSGI framework
- ✅ **FastAPI** - Modern async API framework

### Backend - Java (3 tools)
- ✅ **Spring Boot** - Enterprise Java framework
- ✅ **Maven** - Build automation tool
- ✅ **Gradle** - Build automation system

### Backend - Go (4 frameworks)
- ✅ **Go** - Standard library projects
- ✅ **Gin** - HTTP web framework
- ✅ **Echo** - High performance framework
- ✅ **Fiber** - Express-inspired framework

### Infrastructure (1)
- ✅ **Docker** - Container platform (Dockerfile, docker-compose)

### CI/CD (5 platforms)
- ✅ **GitHub Actions** - GitHub's CI/CD platform
- ✅ **GitLab CI** - GitLab's CI/CD pipelines
- ✅ **CircleCI** - Continuous integration service
- ✅ **Jenkins** - Open source automation server
- ✅ **Travis CI** - CI service for GitHub

**Total: 25+ technology stacks detected!**

## 🔍 How It Works

1. **Scans Project Files**
   - Searches for `package.json`, `requirements.txt`, `pom.xml`, `go.mod`, etc.
   - Analyzes dependencies and configuration files

2. **Calculates Confidence Scores**
   - Primary dependency: 50-70% base confidence
   - Supporting packages: +10-20% boost
   - Configuration files: +10% boost

3. **Filters by Threshold**
   - Only includes stacks with ≥70% confidence
   - Prompts user for manual confirmation if needed

4. **Generates Configuration**
   - Creates `.claude/CLAUDE.md` with project overview
   - Creates `.claude/skills/{stack}/SKILL.md` with best practices

## 📖 Detection Examples

### NestJS Project

**Input:**
```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0"
  }
}
```

**Detection:**
```
✓ NestJS detected (100% confidence)
  • Found @nestjs/core in dependencies
  • Found @nestjs/common in dependencies
  • Found NestJS platform adapter
```

### FastAPI Project

**Input:**
```txt
# requirements.txt
fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.5.0
```

**Detection:**
```
✓ FastAPI detected (100% confidence)
  • Found FastAPI in dependencies
  • Found Uvicorn (FastAPI server)
  • Found Pydantic (FastAPI validation)
```

### Docker Project

**Input:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

**Detection:**
```
✓ Docker detected (80% confidence)
  • Found Dockerfile
  • Valid Dockerfile with FROM instruction
```

### Multi-Stack Project

A full-stack project with Next.js + Docker + GitHub Actions:

```
✓ Next.js detected (90% confidence)
✓ Docker detected (80% confidence)
✓ GitHub Actions detected (90% confidence)

Generated files:
  .claude/
    CLAUDE.md
    skills/nextjs/SKILL.md
    skills/docker/SKILL.md
    skills/github-actions/SKILL.md
```

## ⚙️ CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--yes` | `-y` | Skip confirmation prompts | `false` |
| `--no-interaction` | - | Run without any user prompts | `false` |
| `--debug` | `-d` | Enable debug logging | `false` |
| `--output <path>` | `-o` | Custom output directory | `.claude` |

## 🏗️ Generated Files

### CLAUDE.md
- Project overview
- Detected technology stacks
- Architecture information
- Common commands
- Development workflow

### skills/{stack}/SKILL.md
- Framework-specific best practices
- Common patterns and examples
- Testing strategies
- Configuration examples
- Useful commands and tips

## 🔧 Development

### Prerequisites

- Node.js ≥ 20.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/coceresroman/agentify.git
cd agentify

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev init

# Run tests
npm test

# Link for global usage
npm link
```

### Project Structure

```
agentify/
├── src/
│   ├── cli.ts                 # CLI entry point
│   ├── commands/
│   │   └── init.ts           # Init command implementation
│   ├── detectors/            # Technology detectors
│   │   ├── node.detector.ts  # Node.js frameworks
│   │   ├── python.detector.ts
│   │   ├── java.detector.ts
│   │   ├── go.detector.ts
│   │   ├── docker.detector.ts
│   │   ├── ci.detector.ts
│   │   └── index.ts          # Detector registry
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── templates/            # Handlebars templates
│   │   ├── claude-md/
│   │   └── skills/
│   ├── analyzer.ts           # Confidence filtering
│   ├── prompts.ts            # Interactive prompts
│   ├── generator.ts          # Template rendering
│   ├── writer.ts             # File writing
│   └── constants.ts          # Configuration constants
├── tests/                    # Test files
├── bin/                      # Executable scripts
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

### Adding a New Detector

1. Create detector file in `src/detectors/`:

```typescript
// src/detectors/custom.detector.ts
import { DetectorFunction } from '../types/index.js';

export const detect: DetectorFunction = async (projectRoot) => {
  // Your detection logic
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

2. Register in `src/detectors/index.ts`:

```typescript
import { detect as detectCustom } from './custom.detector.js';

const detectors: DetectorFunction[] = [
  // ... existing detectors
  detectCustom,
];
```

3. Create skill template in `src/templates/skills/my-framework/SKILL.md.hbs`

4. Add tests in `tests/unit/detectors/custom.detector.test.ts`

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/my-detector`)
3. **Add your detector** with tests
4. **Commit your changes** (`git commit -am 'Add detector for X'`)
5. **Push to the branch** (`git push origin feature/my-detector`)
6. **Create a Pull Request**

### Guidelines

- Write tests for new detectors
- Follow the existing code style
- Update documentation
- Add your detector to the supported stacks list

## 📄 License

This project is licensed under the **GNU General Public License v2.0**.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@coceresroman/agentify)
- [GitHub Repository](https://github.com/coceresroman/agentify)
- [Issue Tracker](https://github.com/coceresroman/agentify/issues)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)

## 🙏 Acknowledgments

- Built for the [Claude Code](https://claude.ai/claude-code) community
- Inspired by the need for better AI-assisted development workflows
- Thanks to all contributors who help expand detector support

## 📊 Stats

- **25+ Stacks Detected** across 6 ecosystems
- **12 Skill Templates** with best practices
- **22 Tests** ensuring reliability
- **TypeScript** for type safety
- **GPL-2.0** Open Source License

---

**Made with ❤️ by [Coceres Roman](https://github.com/coceresroman)**

**Star ⭐ this repo if you find it useful!**
