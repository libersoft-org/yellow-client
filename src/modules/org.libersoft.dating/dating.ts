import { writable, type Writable } from 'svelte/store';

export let page: Writable<string> = writable('people');
