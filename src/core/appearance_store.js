// import { current_theme, themes_stored } from './core.js';
import { derived, get } from 'svelte/store';
import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
import { log } from '@/core/tauri.ts';
export let selected_theme_index = localStorageSharedStore('selected_theme_index', 0);
export const default_theme = {
	name: 'Light',
	properties: {
		'--primary-foreground': '#222',
		'--primary-softer-background': '#ffd',
		'--primary-soft-background': '#ffa',
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
		'--disabled-background': '#888',
		'--disabled-foreground': '#fff',
	},
};
export let themes_stored = localStorageSharedStore('themes_stored', [
	JSON.parse(JSON.stringify(default_theme)),
	{
		name: 'Dark',
		properties: {
			'--primary-foreground': '#fff',
			'--primary-softer-background': '#001',
			'--primary-soft-background': '#012',
			'--primary-background': '#123',
			'--primary-hard-background': '#234',
			'--primary-harder-background': '#345',
			'--secondary-foreground': '#000',
			'--secondary-softer-background': '#888',
			'--secondary-soft-background': '#999',
			'--secondary-background': '#aaa',
			'--secondary-hard-background': '#bbb',
			'--secondary-harder-background': '#ccc',
			'--default-foreground': '#fff',
			'--default-background': '#000',
			'--disabled-background': '#888',
			'--disabled-foreground': '#fff',
		},
	},
]);
export let current_theme = derived([selected_theme_index, themes_stored], ([$selected_theme_index, $themes_stored]) => {
	return $themes_stored[$selected_theme_index];
});

selected_theme_index.subscribe(value => {
	log.debug('selected_theme_index changed to', value);
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
