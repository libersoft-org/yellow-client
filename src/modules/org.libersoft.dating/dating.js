import { writable } from 'svelte/store';
import { hideSidebarMobile, setModule } from '@/core/core.ts';
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
	setModule(null);
}
