import { writable } from 'svelte/store';
import { setModule } from '@/core/core.ts';
import { hideSidebarMobile } from '@/core/stores.ts';

type PageName = 'map' | 'match' | 'people' | 'settings' | null;
export let page = writable<PageName>(null);

export function setPage(name: NonNullable<PageName>) {
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
