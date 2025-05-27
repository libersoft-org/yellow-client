// import { current_theme, themes_stored } from './core.js';
import { get, writable, derived } from 'svelte/store';
import { localStorageReadOnceSharedStore, localStorageSharedStore } from '../lib/svelte-shared-store.ts';


export let selected_theme_index = localStorageSharedStore('selected_theme_index', 0);



export let themes_stored = localStorageSharedStore('themes_stored', [
  {
    name: 'Light',
    properties: {
      "--color-text": "#222",
      "--color-background" : "#fff",
      "--color-foreground" : "#222",

      "--color-card-background" : "#fff",
      "--color-card-foreground" : "#222",

      "--color-reversed-background" : "#222",
      "--color-reversed-foreground" : "#fff",

      "--color-popover": "#333",
      "--color-popover-foreground ": "#444",

      "--color-primary-background" : "#fc1",
      "--color-primary-foreground" : "#222",

      "--color-secondary-background" : "#d80",
      "--color-secondary-foreground" : "#222",

      "--color-tertiary-background": "#ffdd1150",
      "--color-tertiary-foreground": "#fff",

      "--color-muted-background": "#ffd",
      "--color-muted-foreground" : "#222",

      "--color-secondary-muted-background": "#ffa",
      "--color-secondary-muted-foreground": "#222",

      "--color-accent-background" : "#d80",
      "--color-accent-foreground" : "#222",

      "--color-secondary-accent-background" : "#ffd",
      "--color-secondary-accent-foreground" : "#222",

      "--color-disabled-background" : "#888",
      "--color-disabled-foreground" : "#222",

    }
  },
  
  {
    name: 'dark',
    properties: {
        "--color-text": "#007bff",
        "--color-background" : "#fff",
        "--color-foreground" : "#007bff",

        "--color-card-background" : "#fff",
        "--color-card-foreground" : "#007bff",

        "--color-popover": "#005bff",
        "--color-popover-foreground ": "#fff",

        "--color-primary-background" : "#001f3f",
        "--color-primary-foreground" : "#007bff",

        "--color-secondary-background" : "#003366",
        "--color-secondary-foreground" : "#007bff",

        "--color-tertiary-background": "#003366",
        "--color-tertiary-foreground": "#007bff",

        "--color-muted-background": "#003366",
        "--color-muted-foreground" : "#007bff",

        "--color-secondary-muted-background": "#005b96",
        "--color-secondary-muted-foreground": "#007bff",

        "--color-accent-background" : "#003366",
        "--color-accent-foreground" : "#007bff",

        "--color-secondary-accent-background" : "#001f3f",
        "--color-secondary-accent-foreground" : "#007bff",

        "--color-disabled-background" : "#888",
        "--color-disabled-foreground" : "#007bff",
    }
  }


]);

export let current_theme = derived([selected_theme_index, themes_stored], ([$selected_theme_index, $themes_stored]) => {
    return $themes_stored[$selected_theme_index];
});


export let init_appearance_store = function($selected_theme_index, $themes_stored) {

};