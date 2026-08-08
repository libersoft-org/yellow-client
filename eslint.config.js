import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';
import { consoleBaseline } from './eslint.console-baseline.js';

/* This config exists for one rule: no-console.
 *
 * Secrets are scrubbed centrally by src/core/scripts/log.ts and, at runtime, by
 * src/core/scripts/console-redaction.ts - but neither can help code that has not been written yet
 * if it reaches for console directly. New code should use `log.*`.
 *
 * The rule is an ERROR, with a baseline: every file that already had console calls when the rule was
 * introduced is listed in eslint.console-baseline.js and stays at 'warn'. So the existing debt does
 * not break the build, while any *new* file that reaches for console fails CI. Shrinking the
 * baseline is how the debt gets paid down.
 */
export default tseslint.config(
	{
		ignores: ['build/', 'build-tauri/', 'dist/', '.svelte-kit/', 'node_modules/', 'static/', 'test-results/', 'playwright-report/', 'storybook-static/', 'src/modules/org.libersoft.messages/scripts/emojis_parse_data.ts'],
	},
	js.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			/* console.error and console.warn survive the production build on purpose and are wrapped by
			 * the runtime redactor; everything else should go through log.*. */
			'no-console': ['error', { allow: ['error', 'warn'] }],
			/* Rules that only produce noise on this codebase's existing style. */
			'no-empty': 'off',
			'no-unused-vars': 'off',
			'no-undef': 'off',
			/* Pre-existing findings, kept visible but not blocking: turning them into errors would mean
			 * a mechanical rewrite of unrelated code in the same change. Worth a separate pass. */
			'no-useless-assignment': 'warn',
			'no-unassigned-vars': 'warn',
			'no-async-promise-executor': 'warn',
			'no-self-assign': 'warn',
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
		languageOptions: { parser: tseslint.parser },
		rules: {
			/* The base rule does not understand TypeScript function overloads and reports every
			 * signature as a redeclaration. */
			'no-redeclare': 'off',
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: { parser: tseslint.parser },
		},
		plugins: { svelte },
	},
	{
		/* Pre-existing debt: see eslint.console-baseline.js. */
		files: consoleBaseline,
		rules: { 'no-console': ['warn', { allow: ['error', 'warn'] }] },
	},
	{
		/* Tests and stories print deliberately. */
		files: ['**/tests/**', '**/*.test.ts', '**/*.stories.*', '.storybook/**', 'scripts/**', '*.config.{js,ts}'],
		rules: { 'no-console': 'off' },
	}
);
