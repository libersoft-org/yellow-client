// import { current_theme, themes_stored } from './core.js';
import { get, writable, derived } from 'svelte/store';
import { localStorageReadOnceSharedStore, localStorageSharedStore } from '../lib/svelte-shared-store.ts';


export let selected_theme_index = localStorageSharedStore('selected_theme_index', 0);

export const default_theme =   {
    name: 'Light',
    properties: {
      "--color-text": "#222222",
      "--color-background" : "#FFFFFF",
      "--color-foreground" : "#222222",

      "--color-card-background" : "#FFFFFF",
      "--color-card-foreground" : "#222222",

      "--color-reversed-background" : "#222222",
      "--color-reversed-foreground" : "#FFFFFF",

      "--color-popover": "#333333",
      "--color-popover-foreground ": "#444444",

      "--color-primary-background" : "#ffcc11",
      "--color-primary-foreground" : "#222222",

      "--color-secondary-background" : "#dd8800",
      "--color-secondary-foreground" : "#222222",

      "--color-tertiary-background": "#ffdd1150",
      "--color-tertiary-foreground": "#FFFFFF",

      "--color-muted-background": "#ffffdd",
      "--color-muted-foreground" : "#222222",

      "--color-secondary-muted-background": "#ffffaa",
      "--color-secondary-muted-foreground": "#222222",

      "--color-accent-background" : "#dd8800",
      "--color-accent-foreground" : "#222222",

      "--color-secondary-accent-background" : "#ffffdd",
      "--color-secondary-accent-foreground" : "#222222",

      "--color-disabled-background" : "#888888",
      "--color-disabled-foreground" : "#222222",

    }
  }

export let themes_stored = localStorageSharedStore('themes_stored', [
  
  JSON.parse(JSON.stringify(default_theme))
  ,
  {
    name: 'Dark',
    properties: {
        "--color-text": "#007bff",
        "--color-background" : "#FFFFFF",
        "--color-foreground" : "#007bff",

        "--color-card-background" : "#FFFFFF",
        "--color-card-foreground" : "#007bff",

        "--color-popover": "#005bff",
        "--color-popover-foreground ": "#FFFFFF",

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

        "--color-disabled-background" : "#888888",
        "--color-disabled-foreground" : "#007bff",
    }
  },

  {
    name: "Kung Fury",
    properties: {
        "--color-text": "#007bff",
        "--color-background" : "#003366",
        "--color-foreground" : "#00ff45",

        "--color-card-background" : "#ffffff",
        "--color-card-foreground" : "#007bff",

        "--color-popover": "#005bff",
        "--color-popover-foreground ": "#00ff45",

        "--color-primary-background" : "#3d3047",
        "--color-primary-foreground" : "#a068a1",

        "--color-secondary-background" : "#a068a1",
        "--color-secondary-foreground" : "#51324f",

        "--color-tertiary-background": "#003366",
        "--color-tertiary-foreground": "#00ff45",

        "--color-muted-background": "#a068a1",
        "--color-muted-foreground" : "#007bff",

        "--color-secondary-muted-background": "#a068a1",
        "--color-secondary-muted-foreground": "#007bff",

        "--color-accent-background" : "#003366",
        "--color-accent-foreground" : "#00ff45",

        "--color-secondary-accent-background" : "#001f3f",
        "--color-secondary-accent-foreground" : "#00ff45",

        "--color-disabled-background" : "#888888",
        "--color-disabled-foreground" : "#007bff",      
    }

  }


]);

export let current_theme = derived([selected_theme_index, themes_stored], ([$selected_theme_index, $themes_stored]) => {
    return $themes_stored[$selected_theme_index];
});


export let init_appearance_store = function($selected_theme_index, $themes_stored) {

};