// import { current_theme, themes_stored } from './core.js';
import { get, writable, derived } from 'svelte/store';
import { localStorageReadOnceSharedStore, localStorageSharedStore } from '../lib/svelte-shared-store.ts';


export let selected_theme_index = localStorageSharedStore('selected_theme_index', 0);



export let themes_stored = localStorageSharedStore('themes_stored', [
  {
    name: 'Light',
    properties: {
        "--color-primary": "#fd1",
        "--color-primary-slightly-lighter": "#fd3",
        "--color-primary-light": "#ffa",
        "--color-primary-lighter": "#ffd",
        "--color-secondary": "#d80",
        "--color-tertiary": "#ffdd1150",
        "--color-text": "#000",
        // "--shadow": "0px 0px 20px 0px rgba(0, 0, 0, 0.5)",
        // "--icon-black": "#000",
        // "--icon-white": "#fff",
        // "--icon-gray": "#888",
        // "--icon-yellow": "#fd1",
        // "--icon-red": "#dc2626",
        // "--icon-blue": "#00f",


        // /* Colors */
        // "--yellow-primary": "#ffdd11",
        // "--yellow-bg": "#fefdf7",

        // /* Box shadows */
        // "--yellow-box-shadow": "0 2px 6px rgba(0, 0, 0, 0.3)",

        // "--scroll-bar-color": "#ca0",
        // "--scroll-bar-color-background": "#fea",

    }
  },
  
  {
    name: 'dark',
    properties: {
        "--color-primary": "#001f3f",
        "--color-primary-slightly-lighter": "#001f3f",
        "--color-primary-light": "#003366",
        "--color-primary-lighter": "#005b96",
        "--color-secondary": "#003366",
        "--color-tertiary": "#ffdd1150",
        "--color-text": "#007bff",
        // "--color-primary-lighter": "#333333",
        // "--color-primary": "#252525",
        // "--color-primary-darker": "#1e1e1e",
        // "--color-text": "#fff",
    
        // "--shadow": "0px 0px 20px 0px rgba(0, 0, 0, 0.5)",
        // "--icon-black": "#000",
        // "--icon-white": "#fff",
        // "--icon-gray": "#888",
        // "--icon-yellow": "#abc",
        // "--icon-red": "#dc2626",
        // "--icon-blue": "#00f",


        // /* Colors */
        // "--yellow-primary": "#abc",
        // "--yellow-bg": "#bcd",

        // /* Box shadows */
        // "--yellow-box-shadow": "0 2px 6px rgba(0, 0, 0, 0.3)",

        // "--scroll-bar-color": "#abc",
        // "--scroll-bar-color-background": "#fea",
    }
  }


]);

export let current_theme = derived([selected_theme_index, themes_stored], ([$selected_theme_index, $themes_stored]) => {
    return $themes_stored[$selected_theme_index];
});


export let init_appearance_store = function($selected_theme_index, $themes_stored) {

};