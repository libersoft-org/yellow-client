# Development Guidelines for Yellow Project

## Build, Lint & Test Commands

- Build: `bun run build` or `vite build` (client)
- TypeCheck: `bun run typecheck` or `tsc --noEmit`
- Test (all): `bun test` or `vitest`
- Test (single): `vitest src/path/to/file.test.js`
- Format: `prettier --plugin prettier-plugin-svelte --write "src/**/*.{js,ts,css,html,svelte}"`
- E2E Tests: `npx playwright test`
- Debug Playwright Tests:
  - `PLAYWRIGHT_CONSOLE_LOG=true npx playwright test` (verbose)
  - `PLAYWRIGHT_CONSOLE_LOG=minimal npx playwright test` (theme changes & errors only)
  - `PLAYWRIGHT_CONSOLE_LOG=errors npx playwright test` (errors & warnings only)

## Code Style

- Formatting: Prettier with custom config (1-space tabs, single quotes)
- Naming: camelCase for variables/functions, PascalCase for classes/interfaces
- Components: kebab-case.svelte files, camelCase props
- Files: kebab-case for components, camelCase for utilities
- Types: Prefer explicit typing, strict mode, but noImplicitAny disabled
- Errors: Custom error classes with descriptive names and inheritance
- Imports: Use explicit file extensions (.js, .ts, .svelte)
- Indentation: Uses tabs for indentation

## Architecture

- Small, focused components with clear responsibilities
- Svelte for UI components with TypeScript support
- Modules system for extensible functionality

## Svelte Component Guidelines

**IMPORTANT:** This project currently uses a mix of Svelte 4 and Svelte 5 patterns. Be very careful when editing components - maintain the existing pattern used in each file.

### Svelte 4 Components (Legacy Pattern)

Many existing components use Svelte 4 syntax:

- `export let propName` for props
- `$: reactiveValue = computedExpression` for reactive statements
- `createEventDispatcher()` for events
- Plain `let` declarations for local state

Example (do not change existing Svelte 4 components):

```svelte
<script>
	export let message;
	export let enabled = true;

	let localState = 'initial';
	$: computedValue = message?.content?.toUpperCase();
</script>
```

### Svelte 5 Components (Modern Pattern)

Newer components use Svelte 5 runes:

- `$props()` with destructuring for props
- `$state()` for reactive state
- `$derived()` for computed values
- `$effect()` for side effects (use sparingly)
- `$bindable()` for two-way binding

Example (use for new components):

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		value?: string;
		enabled?: boolean;
	}

	let { children, value = $bindable(''), enabled = true, ...restProps }: Props = $props();
	let someState = $state(false);
	let computedValue = $derived(value?.toUpperCase());

	$effect(() => {
		// Only for side effects, avoid state updates
	});
</script>

<div {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
```

### Component Editing Rules

1. **When editing existing components:** Maintain the existing pattern (Svelte 4 or 5)
2. **When creating new components:** Use Svelte 5 patterns with TypeScript
3. **Do not mix patterns** within the same component
4. **Migration:** Only migrate components to Svelte 5 if explicitly requested

## Testing

- ** IMPORTANT ** When creating playwright tests, use data-testid attributes. Modify the tested components to render them if necessary.
- - Please, use data-testid attributes \*

This file is meant for Claude and other AI assistants to understand project conventions.
