<script>
	import { onMount, setContext, getContext, afterUpdate, tick, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { getGuid } from '@/core/core.ts';
	export let target = null;
	export let open = false;
	export let x = 0;
	export let y = 0;
	export let ref = null;
	export let width;
	export let height;
	export let scrollable = true;
	export let disableRightClick = false;
	export let bottomOffset;
	const isOpen = writable(open);
	const position = writable([x, y]);
	const currentIndex = writable(-1);
	const hasPopup = writable(false);
	const ctx = getContext('ContextMenu');
	let options = [];
	let direction = 1;
	let prevX = 0;
	let prevY = 0;
	let focusIndex = -1;
	let openDetail = null;
	let currentInstance;
	let menus = getContext('menus');

	$: isOpen.set(open);

	export function close() {
		open = false;
		x = 0;
		y = 0;
		prevX = 0;
		prevY = 0;
		focusIndex = -1;
		//console.log('context-menu close currentInstance:', currentInstance, 'menus:', menus);
		for (let menu of Array.from(menus)) {
			if (menu.guid === currentInstance) {
				//console.log('found myself, menus.length:', menus.length);
				menus.splice(menus.indexOf(menu), 1);
				//console.log('context-menu close: menus.length:', menus.length);
				break;
			}
		}
		//console.log('->context-menu close:', menus);
		currentInstance = null;
	}

	export async function openMenu(e) {
		//console.log('context-menu openMenu:', e);
		// Only proceed for right clicks (button 2) or touch events
		if (disableRightClick && (e.type === 'contextmenu' || e.button === 2)) return;
		if (e.button === 1) return;
		if (e.type === 'touchend') return;
		e.preventDefault?.();
		e.stopPropagation?.();
		console.log('context-menu openMenu type:', e.type);
		//if (e.type === 'contextmenu') return;
		if (e.type === 'longpress') e = e.detail;
		if (open) {
			close();
			return;
		}
		//console.log('context-menu close other menus:', menus);
		let ancestors = getAncestors();
		//console.log('ancestors:', ancestors);
		//console.log('menus:', menus);
		for (let menu of Array.from(menus)) {
			//console.log('menu:', menu);
			if (!ancestors.find(a => a === menu.guid)) {
				//console.log('closing menu:', menu);
				menu.close();
			}
		}

		currentInstance = getGuid();
		menus.push({ guid: currentInstance, close });
		await tick();
		const currentHeight = ref.getBoundingClientRect().height;
		const currentWidth = ref.getBoundingClientRect().width;
		if (open || x === 0) {
			let space_left = e.x;
			let space_right = window.innerWidth - e.x;
			if (space_left > space_right) x = e.x - currentWidth;
			else x = e.x;
		}
		if (x + currentWidth > window.innerWidth) x = Math.max(0, window.innerWidth - currentWidth);
		let e_y = e.y;
		if (open || y === 0) {
			if (bottomOffset) {
				e_y = window.innerHeight - currentHeight - bottomOffset;
			}
			if (window.innerHeight - currentHeight < e_y) {
				y = e_y - currentHeight;
				if (y < 10) y = 10;
			} else y = e_y;
		}
		let newHeight = window.innerHeight - y - 10;
		if (newHeight < height) height = newHeight + 'px'; // TODO: this doesn't work well, should make the window smaller if the screen is too small
		let newWidth = window.innerWidth - x - 10;
		if (newWidth < width) width = newWidth + 'px'; // TODO: this doesn't work well, should make the window smaller if the screen is too small
		position.set([x, y]);
		//console.log('context-menu openMenu position:', x, y);
		open = true;
		openDetail = e.target;
	}

	$: if (target != null) {
		if (Array.isArray(target)) {
			target.forEach(node => subscribe(node));
		} else subscribe(target);
	}

	function subscribe(node) {
		if (!node) return;
		if (!disableRightClick) node.addEventListener('contextmenu', openMenu);
		node.addEventListener('mousedown', openMenu);
	}

	onMount(() => {
		return () => {
			if (target != null) {
				if (Array.isArray(target)) {
					target.forEach(node => {
						node?.removeEventListener('contextmenu', openMenu);
						node?.removeEventListener('mousedown', openMenu);
					});
				} else {
					target.removeEventListener('contextmenu', openMenu);
					target.removeEventListener('mousedown', openMenu);
				}
			}
		};
	});

	onDestroy(() => {
		close();
	});

	function getAncestors() {
		let result = [];
		let c = ctx;
		while (c) {
			let i = c.instance();
			if (i) result.push(i);
			c = c.parent;
		}
		return result;
	}

	setContext('ContextMenu', {
		instance: () => currentInstance,
		parent: ctx,
		currentIndex,
		position,
		isOpen,
		close,
		setPopup: popup => {
			hasPopup.set(popup);
		},
	});
	setContext('Popup', {
		close,
	});

	afterUpdate(() => {
		if (open) {
			options = ref.children;
			console.log('context-menu options:', options);
			if (level === 1) {
				if (prevX !== x || prevY !== y) ref.focus();
				prevX = x;
				prevY = y;
			}
			//onOpen?.(openDetail);
		} else {
			//onClose?.();
		}

		if (!$hasPopup && options[focusIndex]) {
			console.log('focus:', focusIndex);
			options[focusIndex].focus();
		}
	});

	$: level = !ctx ? 1 : 2;
	$: currentIndex.set(focusIndex);
</script>

<style>
	.context-menu {
		display: flex;
		flex-direction: column;
		visibility: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		position: fixed;
		z-index: 9000;
		border-radius: 10px;
		border: 1px solid var(--secondary-background);
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	.context-menu-open {
		visibility: visible;
	}
</style>

<svelte:window
	on:mousedown={e => {
		//console.log('context-menu svelte:window click:', e);
		//console.log(e.target);
		let ancestor = e.target.closest('.context-menu');
		//console.log('ancestor:', ancestor);
		if (ancestor) return;
		if (!open) return;
		//console.log('context-menu svelte:window click close:', e);
		close();
	}}
/>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->

<!--TODO: parametrize this component to work as either a pop-up (for stickers) or a context menu (for message context menu)
tabindex="-1" (off for pop-up, on for context menu-proper)
 role="menu"
 -->
<div
	bind:this={ref}
	role="none"
	tabindex="-1"
	data-direction={direction}
	data-level={level}
	class:context-menu={true}
	class:context-menu-open={open}
	style:left="{x}px"
	style:top="{y}px"
	style:min-height={height}
	style:max-height={height}
	style:min-width={width}
	style:max-width={width}
	style:overflow={scrollable ? 'auto' : 'hidden'}
	{...$$restProps}
	on:keydown={e => {
		/*if (open) e.preventDefault();  // TODO: parametrize this (off for pop-up, on for context menu-proper)
  if ($hasPopup) return;
  if (e.key === 'ArrowDown') {
   if (focusIndex < options.length - 1) focusIndex++;
  } else if (e.key === 'ArrowUp') {
   if (focusIndex === -1) focusIndex = options.length - 1;
   else if (focusIndex > 0) focusIndex--;
  }*/
		if (open && e.key === 'Escape') {
			console.log('context-menu escape');
			close();
			e.stopPropagation();
			e.preventDefault();
		}
	}}
>
	<slot />
</div>
