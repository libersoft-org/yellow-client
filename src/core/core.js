import { writable } from 'svelte/store';
export const hideSidebarMobile = writable(false);
export let isClientFocused = writable(true);
export let userAddress = null;
export let sessionID = null;

export default { hideSidebarMobile, userAddress, sessionID, isClientFocused };
