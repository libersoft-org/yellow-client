import { writable } from 'svelte/store';
import { setModule } from '@/core/core.ts';
import { hideSidebarMobile } from '@/core/stores.ts';
export let page = writable(null);

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
