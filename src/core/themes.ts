import { derived, get, type Readable, type Writable, writable } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log } from '@/core/tauri.ts';
import { followBrowserTheme } from '@/core/settings.ts';

// Define the Theme interface
export interface Theme {
	name: string;
	properties: Record<string, string>;
}

// Define the type for the selected theme index
export let selected_theme_index: Writable<number> = localStorageSharedStore('selected_theme_index', 0);

// Define the default themes
export const default_themes: Theme[] = [
	{
		name: 'Light',
		properties: {
			'--primary-foreground': '#222',
			'--primary-softer-background': '#ffe',
			'--primary-soft-background': '#fec',
			'--primary-background': '#fc1',
			'--primary-hard-background': '#fa0',
			'--primary-harder-background': '#d80',
			'--secondary-foreground': '#fff',
			'--secondary-softer-background': '#555',
			'--secondary-soft-background': '#444',
			'--secondary-background': '#222',
			'--secondary-hard-background': '#111',
			'--secondary-harder-background': '#000',
			'--default-foreground': '#000',
			'--default-background': '#fff',
			'--disabled-background': '#ddd',
			'--disabled-foreground': '#888',
			'--background-image': 'light.webp',
		},
	},
	{
		name: 'Dark',
		properties: {
			'--primary-foreground': '#fff',
			'--primary-softer-background': '#012',
			'--primary-soft-background': '#123',
			'--primary-background': '#234',
			'--primary-hard-background': '#345',
			'--primary-harder-background': '#456',
			'--secondary-foreground': '#000',
			'--secondary-softer-background': '#789',
			'--secondary-soft-background': '#89a',
			'--secondary-background': '#9ab',
			'--secondary-hard-background': '#abc',
			'--secondary-harder-background': '#bde',
			'--default-foreground': '#fff',
			'--default-background': '#000',
			'--disabled-background': '#888',
			'--disabled-foreground': '#333',
			'--background-image': 'dark.webp',
		},
	},
];

// Define the user themes store
export let user_themes: Writable<Theme[]> = localStorageSharedStore('user_themes', []);

// Define the combined themes store
export let themes: Readable<Theme[]> = derived(user_themes, ($custom_themes: Theme[]) => {
	return [...default_themes, ...$custom_themes];
});

// Browser preference detection
export const browserPrefersDark = writable(false);

// Define the current theme store
export let current_theme: Readable<Theme> = derived([selected_theme_index, themes], ([$selected_theme_index, $themes]: [number, Theme[]]) => {
	return $themes[$selected_theme_index];
});

// Initialize browser theme preference detection
export function initBrowserThemeDetection() {
	if (typeof window !== 'undefined') {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		browserPrefersDark.set(mediaQuery.matches);

		mediaQuery.addEventListener('change', e => {
			browserPrefersDark.set(e.matches);
		});

		// Subscribe to browser preference changes
		browserPrefersDark.subscribe(prefersDark => {
			if (get(followBrowserTheme)) {
				selected_theme_index.set(prefersDark ? 1 : 0);
			}
		});

		// Subscribe to followBrowserTheme changes
		followBrowserTheme.subscribe(follow => {
			if (follow) {
				selected_theme_index.set(get(browserPrefersDark) ? 1 : 0);
			}
		});
	}
}

// Subscribe to selected_theme_index changes to validate the index
selected_theme_index.subscribe((v: number) => {
	console.log(`🎨 THEME INDEX CHANGED: ${v} (themes.length: ${get(themes).length})`);

	if (v < 0 || v >= get(themes).length) {
		console.log(`🔴 THEME INDEX OUT OF BOUNDS: ${v}, resetting to 0`);
		selected_theme_index.set(0); // Reset to default if out of bounds
	}
});

// Subscribe to current_theme changes to apply CSS variables
current_theme.subscribe((v: Theme) => {
	log.debug('Current theme changed:', get(current_theme));
	Object.keys(v.properties).forEach((key: string) => {
		const value = v.properties[key];
		console.log('Setting CSS variable:', key, 'to', value);
		if (key === '--background-image') {
			const base = import.meta.env.VITE_CLIENT_PATH_BASE || '';
			const val = `url(${base}/img/background/${value})`;
			console.log('Setting background image:', val);
			document.documentElement.style.setProperty(key, val);
		} else {
			document.documentElement.style.setProperty(key, value);
		}
	});
});

// Dark mode functionality - only for built-in themes (Light = 0, Dark = 1)
export const isDarkMode = derived(selected_theme_index, $selected_theme_index => $selected_theme_index === 1);

export function toggleDarkMode(enabled: boolean): void {
	// Only toggle between built-in themes (Light = 0, Dark = 1)
	// Don't interfere with custom themes (index >= 2)
	const currentIndex = get(selected_theme_index);
	if (currentIndex >= 2) {
		return;
	}

	selected_theme_index.set(enabled ? 1 : 0);
}
