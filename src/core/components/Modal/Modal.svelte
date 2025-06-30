<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import { mobileClass, isMobile, debug } from '@/core/stores.ts';
	import { draggable } from '@neodrag/svelte';
	import { bringToFront, registerModal, unregisterModal } from '@/lib/modal-index-manager.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Portal from '@/core/components/Portal/Portal.svelte';
	interface Props {
		testId?: string;
		children?: Snippet;
		top?: Snippet;
		center?: Snippet;
		bottom?: Snippet;
		params?: any;
		max?: boolean;
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
	let { testId = '', children, top, center, bottom, params, max, optionalIcon, title = '', body, width, height, onShowChange }: Props = $props();
	let elModal: HTMLDivElement | null = $state(null);
	let showContent = $state(false);
	let ModalBody = $state<Snippet>(body);
	let zIndex = $state(100);
	let modalId: number;
	let isDragging = false;
	let resizeObserver: ResizeObserver;
	let focused = $state(false);

	setContext('setTitle', setTitle);
	setContext('Popup', { close });

	$effect(() => {
		if (!elModal) return;
		elModal.addEventListener('focusin', onFocusIn);
		elModal.addEventListener('focusout', onFocusOut);
		return () => {
			if (!elModal) {
				console.error('[Modal] elModal is not defined 2');
				return;
			}
			elModal.removeEventListener('focusin', onFocusIn);
			elModal.removeEventListener('focusout', onFocusOut);
		};
	});

	$effect(() => {
		if (!$isMobile) return;
		if (elModal && showContent && !isDragging) {
			centerModal();
			requestAnimationFrame(snapTransformIntoBounds);
		}
	});

	$effect(() => {
		showUpdated(show);
		modalId = registerModal(z => (zIndex = z));

		function handleResize() {
			if ($isMobile) {
				centerModal();
				if (!isDragging) requestAnimationFrame(snapTransformIntoBounds);
			} else {
				requestAnimationFrame(() => {
					if (elModal && showContent) centerModal();
				});
			}
		}

		if (elModal) {
			let didInit = false;
			resizeObserver = new ResizeObserver(() => {
				if (isDragging) return;
				if (didInit) handleResize();
				else didInit = true;
			});
			resizeObserver.observe(elModal);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			unregisterModal(modalId);
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
		requestAnimationFrame(snapTransformIntoBounds);
	}

	function raiseZIndex() {
		bringToFront(modalId);
	}

	async function showUpdated(showing: boolean) {
		if (showing) {
			await tick();
			elModal?.focus();
			showContent = true;
			await tick();
			centerModal();
			requestAnimationFrame(snapTransformIntoBounds);
		} else {
			showContent = false;
		}
	}

	function centerModal() {
		if (!elModal) return;
		if ($isMobile) {
			// On mobile, modal takes full width but centers vertically
			const rect = elModal.getBoundingClientRect();
			const y = (window.innerHeight - rect.height) / 2;
			elModal.style.transform = `translate3d(0px, ${y}px, 0)`;
			return;
		}
		const rect = elModal.getBoundingClientRect();
		const x = (window.innerWidth - rect.width) / 2;
		const y = (window.innerHeight - rect.height) / 2;
		elModal.style.transform = `translate3d(${x}px, ${y}px, 0)`;
	}

	function snapTransformIntoBounds() {
		if (!elModal) return;
		if (!$isMobile) return;
		const rect = elModal.getBoundingClientRect();
		const padding = 0;
		let dx = 0;
		let dy = 0;
		if (rect.left < padding) dx = padding - rect.left;
		else if (rect.right > window.innerWidth - padding) dx = window.innerWidth - padding - rect.right;
		if (rect.top < padding) dy = padding - rect.top;
		else if (rect.bottom > window.innerHeight - padding) dy = window.innerHeight - padding - rect.bottom;
		if (dx === 0 && dy === 0) return;
		const matrix = new DOMMatrixReadOnly(getComputedStyle(elModal).transform);
		const newX = matrix.m41 + dx;
		const newY = matrix.m42 + dy;
		if (!isDragging) {
			elModal.style.transition = 'none';
			elModal.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			elModal.offsetHeight;
			elModal.style.transition = '';
		} else {
			elModal.style.transition = 'transform 0.2s ease';
			elModal.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			setTimeout(() => {
				if (elModal) elModal.style.transition = '';
			}, 200);
		}
	}

	export function open() {
		setShow(true);
		elModal?.focus();
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

	const dragableConfig = {
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

	.modal {
		z-index: 100;
		display: flex;
		flex-direction: column;
		position: fixed;
		inset: 0;
		box-sizing: border-box;
		width: fit-content;
		max-height: 100dvh;
		height: fit-content;
		overflow: hidden;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		box-shadow: var(--shadow);
		background-color: var(--default-background);
		/*transition: transform 0.4s ease;*/
	}

	:global(.modal.neodrag-dragging) .header {
		cursor: grabbing;
	}

	.modal.mobile {
		max-width: 100% !important;
		max-height: 100% !important;
		width: 100% !important;
		/*height: 100%;*/
		border-radius: 0px;
		border: none;
	}

	.modal.max {
		max-width: 100% !important;
		max-height: 100% !important;
		width: 100% !important;
		height: 100% !important;
		border-radius: 0px;
		border: none;
		transform: none !important;
	}

	.modal .header {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 40px;
		font-weight: bold;
		background-color: var(--disabled-background);
		color: var(--disabled-foreground);
		cursor: grab;
		transition:
			background-color 0.4s linear,
			color 0.4s linear;
	}

	.modal .header.focused {
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}

	.modal .header .title {
		display: flex;
		align-items: center;
		flex-grow: 1;
		user-select: none;
	}

	.modal .header .icons {
		display: flex;
	}

	.modal .header .icons :global(.icon img) {
		transition:
			color 0.4s linear,
			fill 0.4s linear,
			filter 0.4s linear;
	}

	.modal .body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		background-color: var(--background);
		overflow: auto;
		color: var(--primary-foreground);
		height: 100%;
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
		<div class="modal {$mobileClass}" class:max={maximized} role="none" tabindex="-1" style:width style:height bind:this={elModal} use:draggable={dragableConfig} style:z-index={zIndex} onmousedown={raiseZIndex} {onkeydown} data-testid={testId ? testId + '-Modal' : undefined}>
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
									<Icon testId={testId + '-Modal-maximize'} img="img/{maximized ? 'normal' : 'max'}.svg" colorVariable={focused ? '--primary-foreground' : '--disabled-foreground'} alt="⛶" size="20px" padding="10px" onClick={() => (maximized ? restore() : maximize())} />
								</div>
							{/if}
							<div onpointerdown={e => e.stopPropagation()}>
								<Icon testId={testId + '-Modal-close'} img="img/cross.svg" colorVariable={focused ? '--primary-foreground' : '--disabled-foreground'} alt="X" size="20px" padding="10px" onClick={close} />
							</div>
						</div>
					{/if}
				</div>
				<div class="body">
					{#if $debug}
						params: <code>{JSON.stringify({ params })}</code>
					{/if}
					{#if typeof ModalBody === 'function'}
						<ModalBody {params} {close} />
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
