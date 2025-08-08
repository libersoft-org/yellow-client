<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import { mobileClass, isMobile, debug } from '@/core/scripts/stores.ts';
	import { draggable } from '@neodrag/svelte';
	import { bringToFront, registerWindow, unregisterWindow } from '@/lib/window-index-manager.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Portal from '@/core/components/Portal/Portal.svelte';

	export interface IWindowBodyWithOnOpen<TParams extends readonly unknown[] = readonly unknown[]> {
		onOpen?(...args: TParams): void | Promise<void>;
	}

	interface Props {
		testId?: string;
		children?: Snippet;
		top?: Snippet;
		center?: Snippet;
		bottom?: Snippet;
		params?: any;
		max?: boolean;
		resizable?: boolean;
		optionalIcon?: {
			img: string;
			alt?: string;
			onClick?: (e: Event) => void;
		};
		title?: string;
		body?: any;
		width?: string;
		height?: string;
		onShowChange?: (show: boolean) => void;
	}
	let show = $state(false);
	let maximized = $state(false);
	let { testId = '', children, top, center, bottom, params, max, resizable = false, optionalIcon, title = '', body, width, height, onShowChange }: Props = $props();
	let elWindow: HTMLDivElement | null = $state(null);
	let showContent = $state(false);
	let WindowBody = $state<Snippet>(body);
	let zIndex = $state(100);
	let windowId: number;
	let isDragging = false;
	let resizeObserver: ResizeObserver | undefined;
	let focused = $state(false);
	let elWindowBody: any | null = $state(null);
	let lastBrowserWidth = window.innerWidth;
	let lastBrowserHeight = window.innerHeight;
	let hasBeenUserPositioned = false;

	setContext('setTitle', setTitle);
	setContext('Popup', { close });

	$effect(() => {
		if (!$isMobile) return;
		if (elWindow && showContent && !isDragging) {
			centerWindow();
			requestAnimationFrame(snapTransformIntoBounds);
		}
	});

	$effect(() => {
		showUpdated(show);
		windowId = registerWindow(z => (zIndex = z));

		function handleResize() {
			if ($isMobile) {
				if (!isDragging) requestAnimationFrame(snapTransformIntoBounds);
			} else {
				if (!isDragging && elWindow && showContent) requestAnimationFrame(handleWindowResize);
			}
		}

		if (elWindow) {
			let didInit = false;
			resizeObserver = new ResizeObserver(() => {
				if (isDragging) return;
				if (didInit && showContent) {
					requestAnimationFrame(handleContentResize);
				} else {
					didInit = true;
				}
			});
			resizeObserver.observe(elWindow);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			unregisterWindow(windowId);
			window.removeEventListener('resize', handleResize);
			resizeObserver?.disconnect();
		};
	});

	export function isOpen() {
		return show;
	}

	function onFocusIn() {
		focused = true;
	}

	function onFocusOut() {
		focused = false;
	}

	function onDragStart() {
		isDragging = true;
	}

	function onDragEnd() {
		isDragging = false;
		hasBeenUserPositioned = true;
		requestAnimationFrame(snapTransformIntoBounds);
	}

	function raiseZIndex() {
		bringToFront(windowId);
	}

	async function showUpdated(showing: boolean) {
		if (showing) {
			await tick();
			elWindow?.focus();
			showContent = true;
			await tick();
			centerWindow();
			requestAnimationFrame(snapTransformIntoBounds);
		} else {
			showContent = false;
		}
	}

	function centerWindow() {
		if (!elWindow || isDragging) return;

		// Get the center position
		const browserWidth = window.innerWidth;
		const browserHeight = window.innerHeight;
		const windowWidth = elWindow.offsetWidth;
		const windowHeight = elWindow.offsetHeight;

		const centerX = (browserWidth - windowWidth) / 2;
		const centerY = (browserHeight - windowHeight) / 2;

		// Apply absolute positioning instead of transform
		elWindow.style.left = `${centerX}px`;
		elWindow.style.top = `${centerY}px`;
		elWindow.style.transform = 'none';

		// Update last browser dimensions
		lastBrowserWidth = browserWidth;
		lastBrowserHeight = browserHeight;
	}

	function handleWindowResize() {
		if (!elWindow) return;
		const currentWidth = window.innerWidth;
		const currentHeight = window.innerHeight;
		const widthDiff = currentWidth - lastBrowserWidth;
		const heightDiff = currentHeight - lastBrowserHeight;

		// If window hasn't been user-positioned, just re-center it
		if (!hasBeenUserPositioned) {
			centerWindow();
			return;
		}

		// Get current position
		const rect = elWindow.getBoundingClientRect();
		const transform = window.getComputedStyle(elWindow).transform;
		const hasTransform = transform !== 'none';
		// Calculate new position based on window resize
		// Move by half the difference to maintain relative position
		let newLeft = rect.left + widthDiff / 2;
		let newTop = rect.top + heightDiff / 2;
		// Apply bounds checking - no padding for desktop
		const windowWidth = rect.width;
		const windowHeight = rect.height;
		// Horizontal bounds
		if (newLeft + windowWidth > currentWidth) newLeft = currentWidth - windowWidth;
		if (newLeft < 0) newLeft = 0;
		// Vertical bounds
		if (newTop + windowHeight > currentHeight) newTop = currentHeight - windowHeight;
		if (newTop < 0) newTop = 0;
		// Calculate the required movement
		const moveX = newLeft - rect.left;
		const moveY = newTop - rect.top;
		// Apply new position
		if (hasTransform) {
			// If neodrag has a transform, we need to adjust it
			const matrix = new DOMMatrixReadOnly(transform);
			const currentTranslateX = matrix.m41;
			const currentTranslateY = matrix.m42;
			const newTranslateX = currentTranslateX + moveX;
			const newTranslateY = currentTranslateY + moveY;
			elWindow.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
		} else {
			// No transform, just update position
			const baseLeft = parseFloat(elWindow.style.left || '0');
			const baseTop = parseFloat(elWindow.style.top || '0');
			elWindow.style.left = `${baseLeft + moveX}px`;
			elWindow.style.top = `${baseTop + moveY}px`;
		}
		// Update last browser dimensions
		lastBrowserWidth = currentWidth;
		lastBrowserHeight = currentHeight;
	}

	function handleContentResize() {
		if (!elWindow) return;
		// Get current position and size
		const rect = elWindow.getBoundingClientRect();
		const transform = window.getComputedStyle(elWindow).transform;
		const hasTransform = transform !== 'none';
		// Check if window is outside bounds
		const browserWidth = window.innerWidth;
		const browserHeight = window.innerHeight;
		let adjustX = 0;
		let adjustY = 0;
		// Check horizontal bounds
		if (rect.right > browserWidth) adjustX = browserWidth - rect.right;
		if (rect.left < 0) adjustX = -rect.left;
		// Check vertical bounds - only move up if window goes below screen
		if (rect.bottom > browserHeight) adjustY = browserHeight - rect.bottom;
		// Apply adjustment if needed
		if (adjustX !== 0 || adjustY !== 0) {
			if (hasTransform) {
				// If neodrag has a transform, adjust it
				const matrix = new DOMMatrixReadOnly(transform);
				const currentTranslateX = matrix.m41;
				const currentTranslateY = matrix.m42;
				const newTranslateX = currentTranslateX + adjustX;
				const newTranslateY = currentTranslateY + adjustY;
				elWindow.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
			} else {
				// No transform, adjust base position
				const baseLeft = parseFloat(elWindow.style.left || '0');
				const baseTop = parseFloat(elWindow.style.top || '0');
				elWindow.style.left = `${baseLeft + adjustX}px`;
				elWindow.style.top = `${baseTop + adjustY}px`;
			}
		}
	}

	function snapTransformIntoBounds() {
		if (!elWindow) return;
		if (!$isMobile) return;
		const rect = elWindow.getBoundingClientRect();
		const padding = 0;
		let dx = 0;
		let dy = 0;
		if (rect.left < padding) dx = padding - rect.left;
		else if (rect.right > window.innerWidth - padding) dx = window.innerWidth - padding - rect.right;
		if (rect.top < padding) dy = padding - rect.top;
		else if (rect.bottom > window.innerHeight - padding) dy = window.innerHeight - padding - rect.bottom;
		if (dx === 0 && dy === 0) return;
		const matrix = new DOMMatrixReadOnly(getComputedStyle(elWindow).transform);
		const newX = matrix.m41 + dx;
		const newY = matrix.m42 + dy;
		if (!isDragging) {
			elWindow.style.transition = 'none';
			elWindow.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			elWindow.offsetHeight;
			elWindow.style.transition = '';
		} else {
			elWindow.style.transition = 'transform 0.2s ease';
			elWindow.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			setTimeout(() => {
				if (elWindow) elWindow.style.transition = '';
			}, 200);
		}
	}

	export async function open<TParams extends readonly unknown[] = readonly unknown[]>(...params: TParams) {
		console.log('Opening window with params:', params);
		setShow(true);
		elWindow?.focus();
		await tick();
		await tick();
		bringToFront(windowId);
		await (elWindowBody as IWindowBodyWithOnOpen<TParams>)?.onOpen?.(...params);
	}

	export function close() {
		setShow(false);
	}

	export function maximize() {
		maximized = true;
	}

	export function restore() {
		maximized = false;
	}

	function doubleClickHeader() {
		if (max) maximized ? restore() : maximize();
	}

	const draggableConfig = {
		onDragStart,
		onDragEnd,
		gpuAcceleration: true,
		handle: '.header',
		bounds: {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
		},
	};

	function setShow(value: boolean) {
		show = value;
		maximized = false;
		if (!value) {
			hasBeenUserPositioned = false;
		}
		onShowChange?.(value);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			close();
		}
	}

	function setTitle(value: string) {
		title = value;
	}
</script>

<style>
	.overlay {
		z-index: 99;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
	}

	.window {
		z-index: 100;
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		left: 0;
		margin: 0;
		box-sizing: border-box;
		width: fit-content;
		height: auto;
		max-height: 100dvh;
		overflow: hidden;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		box-shadow: var(--shadow);
		background-color: var(--default-background);
	}

	:global(.window.neodrag-dragging) .header {
		cursor: grabbing;
	}

	.window.mobile {
		max-width: 100% !important;
		max-height: 100% !important;
		width: 100% !important;
		border-radius: 0px;
		border: none;
	}

	.window.max {
		max-width: 100% !important;
		max-height: 100% !important;
		width: 100% !important;
		height: 100% !important;
		border-radius: 0px;
		border: none;
		transform: none !important;
	}

	.window .header {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 40px;
		font-weight: bold;
		border-bottom: 1px solid var(--disabled-foreground);
		background-color: var(--disabled-background);
		color: var(--disabled-foreground);
		cursor: grab;
		transition:
			background-color 0.4s linear,
			color 0.4s linear,
			border-color 0.4s linear;
	}

	.window .header.focused {
		border-bottom: 1px solid var(--primary-harder-background);
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}

	.window .header .title {
		display: flex;
		align-items: center;
		flex-grow: 1;
		user-select: none;
	}

	.window .header .icons {
		display: flex;
	}

	.window .header .icons :global(.icon img) {
		transition:
			color 0.4s linear,
			fill 0.4s linear,
			filter 0.4s linear;
	}

	.window .body {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 10px;
		padding: 10px;
		background-color: var(--background);
		overflow: auto;
		color: var(--primary-foreground);
	}

	.top,
	.center,
	.bottom {
		display: flex;
		flex: 1;
	}

	.top {
		align-items: baseline;
	}

	.center {
		align-items: center;
	}

	.bottom {
		align-items: end;
	}
</style>

{#if show}
	<Portal>
		{#if $isMobile}
			<div class="overlay" onpointerdown={close}></div>
		{/if}
		<div class="window {$mobileClass}" class:max={maximized} role="none" tabindex="-1" style:width style:height bind:this={elWindow} use:draggable={draggableConfig} style:z-index={zIndex} onmousedown={raiseZIndex} {onkeydown} data-testid={testId ? testId + '-Window' : undefined} onfocusin={onFocusIn} onfocusout={onFocusOut}>
			{#if showContent}
				<div class="header" class:focused role="none" tabindex="-1" ondblclick={doubleClickHeader}>
					{#if title}
						<div class="title">
							{#if optionalIcon}
								<div class="icons">
									<div onpointerdown={e => e.stopPropagation()}>
										<Icon img={optionalIcon.img} colorVariable={focused ? '--primary-foreground' : '--disabled-foreground'} alt={optionalIcon.alt} onClick={optionalIcon.onClick} size="20px" padding="10px" />
									</div>
								</div>
							{/if}
							<div style:padding-left={optionalIcon ? '0' : '10px'}>{title}</div>
						</div>
						<div class="icons">
							{#if max}
								<div onpointerdown={e => e.stopPropagation()}>
									<Icon testId={testId + '-Window-maximize'} img="img/{maximized ? 'normal' : 'max'}.svg" colorVariable={focused ? '--primary-foreground' : '--disabled-foreground'} alt="⛶" size="20px" padding="10px" onClick={() => (maximized ? restore() : maximize())} />
								</div>
							{/if}
							<div onpointerdown={e => e.stopPropagation()}>
								<Icon testId={testId + '-Window-close'} img="img/cross.svg" colorVariable={focused ? '--primary-foreground' : '--disabled-foreground'} alt="X" size="20px" padding="10px" onClick={close} />
							</div>
						</div>
					{/if}
				</div>
				<div class="body">
					{#if $debug}
						params: <code>{JSON.stringify({ params })}</code>
					{/if}
					{#if typeof WindowBody === 'function'}
						<WindowBody {params} {close} bind:this={elWindowBody} />
					{/if}
					{#if children}
						{@render children?.()}
					{/if}
					{#if top}
						<div class="top">
							{@render top?.()}
						</div>
					{/if}
					{#if center}
						<div class="center">
							{@render center?.()}
						</div>
					{/if}
					{#if bottom}
						<div class="bottom">
							{@render bottom?.()}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</Portal>
{/if}
