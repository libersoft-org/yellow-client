<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy, setContext, getContext, tick } from 'svelte';
	import { writable } from 'svelte/store';
	import { getGuid } from '@/core/scripts/core.ts';

	interface Props {
		target?: HTMLElement | HTMLElement[] | null;
		open?: boolean;
		x?: number;
		y?: number;
		ref?: HTMLDivElement | null;
		width?: string;
		height?: string;
		scrollable?: boolean;
		disableRightClick?: boolean;
		bottomOffset?: number;
		children?: Snippet;
		[key: string]: any;
	}

	let { target = $bindable(null), open = $bindable(false), x = $bindable(0), y = $bindable(0), ref = $bindable(null), width = $bindable(undefined), height = $bindable(undefined), scrollable = true, disableRightClick = false, bottomOffset = undefined, children, ...restProps }: Props = $props();

	export const isOpen = writable(false);
	const position = writable([x, y]);
	const currentIndex = writable(-1);
	const hasPopup = writable(false);
	const ctx = getContext('ContextMenu') as any;
	let direction = 1;
	let prevX = 0;
	let prevY = 0;
	let focusIndex = -1;
	let openDetail: EventTarget | null = null;
	let currentInstance: string | null = null;
	let menus = getContext('menus') as any[];

	let level = $derived(!ctx ? 1 : 2);

	// Track subscribed nodes for proper cleanup
	let subscribedNodes: HTMLElement[] = [];

	function unsubscribeAll(): void {
		for (const node of subscribedNodes) {
			node.removeEventListener('contextmenu', openMenu);
			node.removeEventListener('mousedown', openMenu);
		}
		subscribedNodes = [];
	}

	function subscribeToTarget(t: HTMLElement | HTMLElement[] | null): void {
		unsubscribeAll();
		if (t == null) return;
		const nodes = Array.isArray(t) ? t : [t];
		for (const node of nodes) {
			if (!node) continue;
			if (!disableRightClick) node.addEventListener('contextmenu', openMenu);
			node.addEventListener('mousedown', openMenu);
			subscribedNodes.push(node);
		}
	}

	export function close(): void {
		open = false;
		isOpen.set(false);
		currentIndex.set(-1);
		x = 0;
		y = 0;
		prevX = 0;
		prevY = 0;
		focusIndex = -1;
		for (let menu of Array.from(menus)) {
			if (menu.guid === currentInstance) {
				menus.splice(menus.indexOf(menu), 1);
				break;
			}
		}
		currentInstance = null;
	}

	export async function openMenu(e: MouseEvent | TouchEvent | CustomEvent): Promise<void> {
		const ev = e as any;
		if (disableRightClick && (ev.type === 'contextmenu' || ev.button === 2)) return;
		if (ev.button === 1) return;
		if (ev.type === 'touchend') return;
		ev.preventDefault?.();
		ev.stopPropagation?.();
		console.log('context-menu openMenu type:', ev.type);
		if (ev.type === 'longpress') {
			return openMenu(ev.detail);
		}
		if (open) {
			close();
			return;
		}
		let ancestors = getAncestors();
		for (let menu of Array.from(menus)) {
			if (!ancestors.find((a: string) => a === menu.guid)) {
				menu.close();
			}
		}

		currentInstance = getGuid();
		menus.push({ guid: currentInstance, close });
		await tick();
		if (!ref) return;
		const currentHeight = ref.getBoundingClientRect().height;
		const currentWidth = ref.getBoundingClientRect().width;
		if (open || x === 0) {
			let space_left = ev.x;
			let space_right = window.innerWidth - ev.x;
			if (space_left > space_right) x = ev.x - currentWidth;
			else x = ev.x;
		}
		if (x + currentWidth > window.innerWidth) x = Math.max(0, window.innerWidth - currentWidth);
		let e_y = ev.y;
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
		if (height && newHeight < parseInt(height)) height = newHeight + 'px';
		let newWidth = window.innerWidth - x - 10;
		if (width && newWidth < parseInt(width)) width = newWidth + 'px';
		position.set([x, y]);
		open = true;
		isOpen.set(true);
		openDetail = ev.target;

		// Focus after open
		await tick();
		if (ref && level === 1) {
			if (prevX !== x || prevY !== y) ref.focus();
			prevX = x;
			prevY = y;
		}
	}

	function getAncestors(): string[] {
		let result: string[] = [];
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
		setPopup: (popup: boolean) => {
			hasPopup.set(popup);
		},
	});
	setContext('Popup', {
		close,
	});

	// Subscribe to target after mount (wait for parent bind:this to resolve)
	onMount(async () => {
		await tick();
		subscribeToTarget(target);
	});

	function handleWindowMousedown(e: MouseEvent): void {
		let ancestor = (e.target as HTMLElement).closest('.context-menu');
		if (ancestor) return;
		if (!open) return;
		close();
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (open && e.key === 'Escape') {
			console.log('context-menu escape');
			close();
			e.stopPropagation();
			e.preventDefault();
		}
	}

	onDestroy(() => {
		unsubscribeAll();
		close();
	});
</script>

<style>
	.context-menu {
		z-index: 50;
		display: flex;
		flex-direction: column;
		visibility: hidden;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		position: fixed;
		border-radius: 10px;
		border: 1px solid var(--secondary-background);
		background-color: var(--default-background);
		color: var(--default-foreground);
	}

	.context-menu-open {
		visibility: visible;
	}
</style>

<svelte:window onmousedown={handleWindowMousedown} />

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->

<div bind:this={ref} role="none" tabindex="-1" data-direction={direction} data-level={level} class:context-menu={true} class:context-menu-open={open} style:left="{x}px" style:top="{y}px" style:min-height={height} style:max-height={height} style:min-width={width} style:max-width={width} style:overflow={scrollable ? 'auto' : 'hidden'} {...restProps} onkeydown={handleKeydown}>
	{#if children}
		{@render children()}
	{/if}
</div>
