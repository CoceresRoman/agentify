# 🚀 Guía para Subir Agentify a GitHub

Esta guía te ayudará a subir el proyecto a GitHub y publicarlo en npm.

## 📋 Prerequisitos

1. Cuenta de GitHub: https://github.com/signup
2. Cuenta de npm: https://www.npmjs.com/signup
3. Git instalado en tu máquina

## 🔧 Paso 1: Inicializar Git

```bash
# Dentro del directorio /home/roman/agentify
cd /home/roman/agentify

# Inicializar repositorio git
git init

# Agregar todos los archivos
git add .

# Crear el commit inicial
git commit -m "Initial commit: Agentify v0.1.0

- Auto-detect 25+ technology stacks
- Generate Claude Code configuration files
- Support for Node.js, Python, Java, Go, Docker, CI/CD
- 12 skill templates with best practices
- Interactive CLI with confidence scoring
- GPL-2.0 licensed"
```

## 🌐 Paso 2: Crear Repositorio en GitHub

### Opción A: Desde la Web (Recomendado)

1. Ve a https://github.com/new
2. Repository name: **agentify**
3. Description: **Auto-detect your project's tech stack and generate Claude Code configuration files**
4. Visibility: **Public**
5. ⚠️ **NO** marques "Add a README file" (ya tenemos uno)
6. ⚠️ **NO** marques "Add .gitignore" (ya tenemos uno)
7. ⚠️ **NO** selecciones licencia (ya tenemos GPL-2.0)
8. Click **Create repository**

### Opción B: Desde la Terminal (con gh CLI)

```bash
# Instalar gh CLI si no lo tienes
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh

# Login
gh auth login

# Crear repositorio
gh repo create agentify --public --source=. --remote=origin --description="Auto-detect your project's tech stack and generate Claude Code configuration files"
```

## 📤 Paso 3: Subir el Código a GitHub

```bash
# Agregar remote (solo si usaste Opción A)
git remote add origin https://github.com/coceresroman/agentify.git

# Verificar remote
git remote -v

# Subir a GitHub
git branch -M main
git push -u origin main
```

## ✅ Paso 4: Verificar en GitHub

Visita: https://github.com/coceresroman/agentify

Deberías ver:
- ✅ README.md renderizado
- ✅ Badges de npm, licencia, Node.js
- ✅ Todos los archivos del proyecto
- ✅ LICENSE (GPL-2.0)
- ✅ CONTRIBUTING.md

## 🏷️ Paso 5: Crear Release (Opcional pero Recomendado)

### Desde GitHub Web

1. Ve a tu repositorio
2. Click en **Releases** (lado derecho)
3. Click **Create a new release**
4. Tag version: **v0.1.0**
5. Release title: **v0.1.0 - Initial Release**
6. Description:
   ```markdown
   ## 🎉 Initial Release

   Agentify is a CLI tool that auto-detects your project's technology stack and generates Claude Code configuration files.

   ### ✨ Features
   - 🔍 Auto-detect 25+ technology stacks
   - 📝 Generate CLAUDE.md and SKILL.md files
   - 💬 Interactive prompts with confidence scoring
   - 🎯 Support for Node.js, Python, Java, Go, Docker, CI/CD

   ### 📦 Installation
   \```bash
   npx @coceresroman/agentify init
   \```

   ### 🛠️ Supported Stacks
   - Frontend: React, Vue, Angular, Next.js, Remix
   - Backend: NestJS, Express, Fastify, Koa, Django, Flask, FastAPI, Spring Boot
   - Languages: Node.js, Python, Java, Go
   - Infrastructure: Docker
   - CI/CD: GitHub Actions, GitLab CI, CircleCI, Jenkins, Travis CI
   ```
7. Click **Publish release**

### Desde Terminal (con gh CLI)

```bash
gh release create v0.1.0 \
  --title "v0.1.0 - Initial Release" \
  --notes "Initial release of Agentify - Auto-detect tech stacks and generate Claude Code configuration files"
```

## 📦 Paso 6: Publicar en npm

```bash
# Login en npm (si no lo has hecho)
npm login

# Verificar el empaquetado
npm pack --dry-run

# Publicar (primera vez, como público)
npm publish --access public

# Verificar la publicación
npm view @coceresroman/agentify
```

## 🎯 Paso 7: Probar la Instalación

```bash
# En otro directorio
cd /tmp
mkdir test-agentify
cd test-agentify

# Probar con npx
npx @coceresroman/agentify@latest init

# Debería mostrar:
# "No stacks detected" (porque es un directorio vacío)
```

## 🔄 Actualizaciones Futuras

### Workflow de Desarrollo

```bash
# 1. Hacer cambios
git add .
git commit -m "feat: Add support for Ruby detector"

# 2. Actualizar versión
npm version patch  # 0.1.0 -> 0.1.1 (bug fixes)
# npm version minor  # 0.1.0 -> 0.2.0 (new features)
# npm version major  # 0.1.0 -> 1.0.0 (breaking changes)

# 3. Push con tags
git push && git push --tags

# 4. Publicar en npm
npm publish --access public

# 5. Crear release en GitHub
gh release create v0.1.1 --generate-notes
```

## 📊 Paso 8: Configurar GitHub (Opcional)

### Agregar Topics

En GitHub, ve a tu repo → Settings → Topics y agrega:
- `cli`
- `claude`
- `claude-code`
- `automation`
- `stack-detection`
- `typescript`
- `nodejs`

### Habilitar Issues

Settings → General → Features → ✅ Issues

### Configurar Branch Protection (cuando tengas colaboradores)

Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

## 🎨 Paso 9: Agregar Badge de CI (después del primer workflow)

Después de que se ejecute el primer workflow de CI, actualiza el README con:

```markdown
[![CI](https://github.com/coceresroman/agentify/workflows/CI/badge.svg)](https://github.com/coceresroman/agentify/actions)
```

## ✅ Checklist Final

Antes de publicar, verifica:

- [ ] README.md está completo y sin errores
- [ ] LICENSE existe (GPL-2.0)
- [ ] package.json tiene la información correcta
- [ ] .gitignore está configurado
- [ ] .npmignore excluye archivos innecesarios
- [ ] Tests pasan: `npm test`
- [ ] Build funciona: `npm run build`
- [ ] Version es correcta: `0.1.0`
- [ ] Repository URLs son correctas

## 🆘 Troubleshooting

### Error: "Repository not found"
```bash
# Verificar remote
git remote -v

# Actualizar remote
git remote set-url origin https://github.com/coceresroman/agentify.git
```

### Error al publicar en npm: "403 Forbidden"
```bash
# Verificar login
npm whoami

# Re-login
npm logout
npm login
```

### Error: "Package name already exists"
```bash
# El nombre @coceresroman/agentify ya está disponible
# Si da error, verifica que estés usando tu scope correcto
```

## 🎉 ¡Listo!

Tu proyecto ahora está:
- ✅ En GitHub: https://github.com/coceresroman/agentify
- ✅ En npm: https://www.npmjs.com/package/@coceresroman/agentify
- ✅ Con CI configurado (GitHub Actions)
- ✅ Listo para recibir contribuciones

---

**Próximos pasos:**
1. Compartir en redes sociales
2. Agregar al README de Claude Code (si es oficial)
3. Crear ejemplos de uso en el wiki
4. Responder issues y PRs
