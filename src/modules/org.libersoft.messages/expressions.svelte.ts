import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';

export let expressions_renderer = localStorageSharedStore('expressions_renderer', 'canvas');
export let animate_all_expressions = localStorageSharedStore('animate_all_expressions', true);
