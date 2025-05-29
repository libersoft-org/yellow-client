// import { current_theme, themes_stored } from './core.js';
import { derived, get } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
export let selected_theme_index = localStorageSharedStore('selected_theme_index', 0);
export const default_theme = {
	name: 'Light',
	properties: {
		'--color-primary-foreground': '#222',
		'--color-primary-softer-background': '#ffd',
		'--color-primary-soft-background': '#ffa',
		'--color-primary-background': '#fc1',
		'--color-primary-hard-background': '#fa0',
		'--color-primary-harder-background': '#d80',
		'--color-secondary-foreground': '#fff',
		'--color-secondary-softer-background': '#555',
		'--color-secondary-soft-background': '#444',
		'--color-secondary-background': '#222',
		'--color-secondary-hard-background': '#111',
		'--color-secondary-harder-background': '#000',
		'--color-default-foreground': '#000',
		'--color-default-background': '#fff',
		'--color-disabled-background': '#888',
		'--color-disabled-foreground': '#fff',
	},
};
export let themes_stored = localStorageSharedStore('themes_stored', [
	JSON.parse(JSON.stringify(default_theme)),
	{
		name: 'Dark',
		properties: {
			'--color-primary-foreground': '#fff',
			'--color-primary-softer-background': '#000',
			'--color-primary-soft-background': '#111',
			'--color-primary-background': '#222',
			'--color-primary-hard-background': '#333',
			'--color-primary-harder-background': '#444',
			'--color-secondary-foreground': '#000',
			'--color-secondary-softer-background': '#555',
			'--color-secondary-soft-background': '#666',
			'--color-secondary-background': '#777',
			'--color-secondary-hard-background': '#888',
			'--color-secondary-harder-background': '#999',
			'--color-default-foreground': '#fff',
			'--color-default-background': '#000',
			'--color-disabled-background': '#888',
			'--color-disabled-foreground': '#fff',
		},
	},
]);
export let current_theme = derived([selected_theme_index, themes_stored], ([$selected_theme_index, $themes_stored]) => {
	return $themes_stored[$selected_theme_index];
});

selected_theme_index.subscribe(value => {
	//   console.log($themes_stored[value].properties);
	Object.keys(get(themes_stored)[value].properties).forEach(key => {
		//   console.log(`${key}: ${$themes_stored[value].properties[key]}`);
		document.documentElement.style.setProperty(key, get(themes_stored)[value].properties[key]);
	});
});
current_theme.subscribe(() => {
	//   console.log($themes_stored[value].properties);

	Object.keys(get(themes_stored)[get(selected_theme_index)].properties).forEach(key => {
		//   console.log(`${key}: ${$themes_stored[value].properties[key]}`);
		document.documentElement.style.setProperty(key, get(themes_stored)[get(selected_theme_index)].properties[key]);
	});
});
