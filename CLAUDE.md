# Development Guidelines for Yellow Project

## Build, Lint & Test Commands
- Build: `bun run build` or `vite build` (client)
- TypeCheck: `bun run typecheck` or `tsc --noEmit`
- Test (all): `bun test` or `vitest`
- Test (single): `vitest src/path/to/file.test.js`
- Format: `prettier --config prettier-libersoft.json --plugin prettier-plugin-svelte --write "src/**/*.{js,ts,css,html,svelte}"`

## Code Style
- Formatting: Prettier with custom config (1-space tabs, single quotes)
- Naming: camelCase for variables/functions, PascalCase for classes/interfaces
- Components: kebab-case.svelte files, camelCase props
- Files: kebab-case for components, camelCase for utilities
- Types: Prefer explicit typing, strict mode, but noImplicitAny disabled
- Errors: Custom error classes with descriptive names and inheritance
- Imports: Use explicit file extensions (.js, .ts, .svelte)

## Architecture
- Small, focused components with clear responsibilities
- Svelte for UI components with TypeScript support
- Modules system for extensible functionality

This file is meant for Claude and other AI assistants to understand project conventions.





