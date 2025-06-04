import { writable } from 'svelte/store';
import { hideSidebarMobile } from '@/core/core.ts';
import { selected_module_id } from '@/core/stores.ts';
export let page = writable('people');

export function setPage(name) {
	page.set(name);
	hideSidebarMobile.set(true);
}

export function closePage() {
	page.set(null);
	hideSidebarMobile.set(false);
}

export function closeModule() {
	hideSidebarMobile.set(false);
	selected_module_id.set(null);
}
