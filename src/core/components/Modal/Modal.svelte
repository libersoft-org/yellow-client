<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { debug, isMobile } from '../../core.ts';
	import { bringToFront, registerModal, unregisterModal } from '@/lib/modal-index-manager.js';
	import { draggable } from '@neodrag/svelte';
	import Portal from '../Portal/Portal.svelte';
	let { show = $bindable(false), children, params, title = '', body = {}, width, height, onShowChange = () => {}, onOptionalIconClick = $bindable(), optionalIconImage = $bindable() }: Props = $props();
	let modalEl: HTMLDivElement | null = $state(null);
	let showContent = $state(false);
	let ModalBody = $state<Snippet>(body);
	let zIndex = $state(100);
	let modalId: number;
	let isDragging = false;
	let resizeObserver: ResizeObserver;
	interface Props {
		show?: boolean;
		params?: any;
		title?: string;
		body?: any;
		width?: string;
		height?: string;
		children?: Snippet;
		onShowChange?: (show: boolean) => void;
		onOptionalIconClick: (e: Event) => void;
		optionalIconImage: any;
	}

	$effect(() => {
		if (!isMobile) return;
		if (modalEl && showContent && !isDragging) {
			centerModal();
			requestAnimationFrame(snapTransformIntoBounds);
		}
	});

	$effect(() => {
		showUpdated(show);
		modalId = registerModal(z => (zIndex = z));

		function handleResize() {
			if (!isMobile) return;
			centerModal();
			if (!isDragging) requestAnimationFrame(snapTransformIntoBounds);
		}

		if (modalEl) {
			let didInit = false;
			resizeObserver = new ResizeObserver(() => {
				if (!isMobile) return;
				if (isDragging) return;
				if (didInit) {
					centerModal();
					requestAnimationFrame(snapTransformIntoBounds);
				} else {
					didInit = true;
				}
			});
			resizeObserver.observe(modalEl);
		}

		window.addEventListener('resize', handleResize);

		return () => {
			unregisterModal(modalId);
			window.removeEventListener('resize', handleResize);
			resizeObserver?.disconnect();
		};
	});

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
			modalEl?.focus();
			showContent = true;
			await tick();
			centerModal();
			requestAnimationFrame(snapTransformIntoBounds);
		} else {
			showContent = false;
		}
	}

	function centerModal() {
		if (!modalEl) return;
		const rect = modalEl.getBoundingClientRect();
		const x = (window.innerWidth - rect.width) / 2;
		const y = (window.innerHeight - rect.height) / 2;
		modalEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
	}

	function snapTransformIntoBounds() {
		if (!modalEl) return;
		if (!isMobile) return;
		const rect = modalEl.getBoundingClientRect();
		const padding = 0;
		let dx = 0;
		let dy = 0;
		if (rect.left < padding) dx = padding - rect.left;
		else if (rect.right > window.innerWidth - padding) dx = window.innerWidth - padding - rect.right;
		if (rect.top < padding) dy = padding - rect.top;
		else if (rect.bottom > window.innerHeight - padding) dy = window.innerHeight - padding - rect.bottom;
		if (dx === 0 && dy === 0) return;
		const matrix = new DOMMatrixReadOnly(getComputedStyle(modalEl).transform);
		const newX = matrix.m41 + dx;
		const newY = matrix.m42 + dy;
		if (!isDragging) {
			modalEl.style.transition = 'none';
			modalEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			modalEl.offsetHeight;
			modalEl.style.transition = '';
		} else {
			modalEl.style.transition = 'transform 0.2s ease';
			modalEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
			setTimeout(() => {
				if (modalEl) modalEl.style.transition = '';
			}, 200);
		}
	}

	export function open() {
		setShow(true);
	}

	export function close() {
		setShow(false);
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
		onShowChange?.(value);
	}

	// like button
	function handleOptionalIconClick(e) {
		if (onOptionalIconClick) {
			onOptionalIconClick(e);
		}
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

	setContext('setTitle', setTitle);
	setContext('Popup', { close });
</script>

<style>
	.modal {
		z-index: 100;
		display: flex;
		flex-direction: column;
		position: fixed;
		inset: 0;
		max-width: 700px;
		width: 100%;
		max-height: calc(100dvh - 48px);
		height: fit-content;
		width: min-content;
		overflow: hidden;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		box-shadow: var(--shadow);
		background-color: var(--default-background);

		@media (max-width: 768px) {
			max-width: calc(100%) !important;
			max-height: calc(100%) !important;
			height: 100%;
			width: 100% !important;
			border-radius: 0px;
			border: none;
		}

		:global(&.neodrag-dragging) {
			.header {
				cursor: grabbing;
			}
		}
	}

	.modal .header {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: bold;
		background-color: var(--primary-background);
		color: var(--primary-foreground);
		cursor: grab;
	}

	.modal .header .title {
		display: flex;
		align-items: center;
		padding: 10px;
		flex-grow: 1;
		user-select: none;

		:global(.icon) {
			padding: 0 10px 0 0 !important;
		}
	}

	.modal .body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		background-color: var(--background);
		overflow: auto;
		color: var(--primary-foreground);
	}
</style>

{#if show}
	<Portal>
		<div class="modal" role="none" tabindex="-1" style:width style:height style:max-width={width} style:max-height={height} bind:this={modalEl} use:draggable={dragableConfig} style:z-index={zIndex} onmousedown={raiseZIndex} {onkeydown}>
			{#if showContent}
				<div class="header" role="none" tabindex="-1">
					{#if title}
						<div class="title">
							{#if optionalIconImage}
								<Icon img={optionalIconImage} alt="" colorVariable="--primary-foreground" size="20px" padding="10px" onClick={handleOptionalIconClick} />
							{/if}
							{title}
						</div>
						<div onpointerdown={e => e.stopPropagation()}>
							<Icon data-testid="Modal-close" img="img/close.svg" alt="X" colorVariable="--primary-foreground" size="20px" padding="10px" onClick={close} />
						</div>
					{/if}
				</div>
				<div class="body">
					{#if $debug}
						params: <code>{JSON.stringify({ params })}</code>
					{/if}
					{#if typeof ModalBody === 'function'}
						<ModalBody {close} {params} bind:onOptionalIconClick bind:optionalIconImage />
					{:else if children}
						{@render children?.()}
					{/if}
				</div>
			{/if}
		</div>
	</Portal>
{/if}
