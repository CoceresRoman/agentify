# agentify

CLI open source que detecta el stack de un proyecto y genera automáticamente archivos `CLAUDE.md` y `SKILL.md` para Claude Code.

## Comandos esenciales

```bash
npm run dev          # Corre el CLI en modo desarrollo
npm run build        # Compila TypeScript a dist/
npm run test         # Corre tests con vitest
npm run test:watch   # Tests en modo watch
npx ts-node src/cli.ts init   # Prueba el comando init localmente
```

## Arquitectura

```
src/
  cli.ts              # Entry point, Commander setup
  commands/
    init.ts           # Comando: agentify init
    add.ts            # Comando: agentify add <skill>
  detectors/
    index.ts          # Registry: corre todos los detectors y agrega resultados
    node.detector.ts  # Detecta NestJS / Express / Next.js via package.json
    java.detector.ts  # Detecta Spring Boot via pom.xml / build.gradle
    docker.detector.ts
    ci.detector.ts    # Detecta GitHub Actions, Jenkins
    python.detector.ts
  analyzer.ts         # Combina DetectionResults, aplica confidence threshold (0.7)
  prompts.ts          # Inquirer flows: confirmación y edición del stack detectado
  generator.ts        # Renderiza templates Handlebars con el contexto del stack
  writer.ts           # Escribe archivos en .claude/ del proyecto objetivo
  templates/
    claude-md/        # base.hbs + partials por stack
    skills/           # <stack>/SKILL.md.hbs
```

## Tipos clave

```typescript
type DetectionResult = {
  stack: string       // "nestjs" | "spring-boot" | "docker" | "github-actions" | ...
  confidence: number  // 0 a 1 — si es < 0.7 se pregunta al usuario
  evidence: string[]  // ["Found @nestjs/core in package.json"]
}

type AnalyzedStack = {
  stacks: DetectionResult[]
  projectRoot: string
}
```

## Convenciones

- Todo en TypeScript estricto (`strict: true` en tsconfig)
- Cada detector en su propio archivo, exporta una función `detect(projectRoot: string): Promise<DetectionResult | null>`
- Los templates Handlebars van en `src/templates/`, nunca strings hardcodeados en código
- Tests en `tests/`, un archivo por módulo (`node.detector.test.ts`, etc.)
- Los archivos generados siempre van a `.claude/` dentro del proyecto objetivo, nunca al proyecto de agentify en sí

## Registry de skills de la comunidad

- GitHub es el registry. Repos con topic `agentify-skill` son descubiertos vía GitHub Search API.
- Cada repo debe tener `agentify.json` en la raíz con `{ "id": "autor/nombre", "description": "...", "tags": [] }`
- Comando de instalación: `agentify add coceresroman/nestjs-advanced`
- El campo `id` es la fuente de verdad — el nombre del repo en GitHub no importa

## Stack de este proyecto

- Runtime: Node.js 20+, TypeScript
- CLI: commander, inquirer
- Templates: handlebars
- UX terminal: chalk, ora
- File scanning: glob
- Tests: vitest

## Decisiones de diseño tomadas

- El nombre instalable de un skill viene del campo `id` en `agentify.json`, no del nombre del repo
- Confidence threshold en 0.7: por debajo se le pregunta al usuario antes de incluir el stack
- Modo híbrido: auto-detecta primero, luego muestra preview y permite editar antes de generar
- Los archivos de output siguen la estructura oficial de Claude Code: `.claude/CLAUDE.md` y `.claude/skills/<nombre>/SKILL.md`