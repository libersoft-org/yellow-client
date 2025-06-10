<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import { draggable } from '@neodrag/svelte';
	import { debug } from '@/core/stores.ts';
	import { mobileClass, isMobile } from '@/core/stores.ts';
	import { bringToFront, registerModal, unregisterModal } from '@/lib/modal-index-manager.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Portal from '@/core/components/Portal/Portal.svelte';
	let { testId = '', show = $bindable(false), children, top, center, bottom, params, optionalIcon, title = '', body = {}, width, height, onShowChange = () => {} }: Props = $props();
	let modalEl: HTMLDivElement | null = $state(null);
	let showContent = $state(false);
	let ModalBody = $state<Snippet>(body);
	let zIndex = $state(100);
	let modalId: number;
	let isDragging = false;
	let resizeObserver: ResizeObserver;
	interface Props {
		testId?: string;
		show?: boolean;
		children?: Snippet;
		top?: Snippet;
		center?: Snippet;
		bottom?: Snippet;
		params?: any;
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

	$effect(() => {
		if (!$isMobile) return;
		if (modalEl && showContent && !isDragging) {
			centerModal();
			requestAnimationFrame(snapTransformIntoBounds);
		}
	});

	$effect(() => {
		showUpdated(show);
		modalId = registerModal(z => (zIndex = z));

		function handleResize() {
			if (!$isMobile) return;
			centerModal();
			if (!isDragging) requestAnimationFrame(snapTransformIntoBounds);
		}

		if (modalEl) {
			let didInit = false;
			resizeObserver = new ResizeObserver(() => {
				if (!$isMobile) return;
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
		if (!$isMobile) return;
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
		width: 100%;
		max-height: calc(100dvh - 2px);
		height: fit-content;
		width: min-content;
		overflow: hidden;
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
		box-shadow: var(--shadow);
		background-color: var(--default-background);

		:global(&.neodrag-dragging) {
			.header {
				cursor: grabbing;
			}
		}
	}

	.modal.mobile {
		max-width: calc(100%) !important;
		max-height: calc(100%) !important;
		height: 100%;
		width: 100% !important;
		border-radius: 0px;
		border: none;
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
		<div class="modal {$mobileClass}" role="none" tabindex="-1" style:width style:height style:max-width={width} style:max-height={height} bind:this={modalEl} use:draggable={dragableConfig} style:z-index={zIndex} onmousedown={raiseZIndex} {onkeydown} data-testid={testId ? testId + '-Modal' : undefined}>
			{#if showContent}
				<div class="header" role="none" tabindex="-1">
					{#if title}
						<div class="title">
							{#if optionalIcon}
								<div onpointerdown={e => e.stopPropagation()}>
									<Icon img={optionalIcon.img} colorVariable="--primary-foreground" alt={optionalIcon.alt} onClick={optionalIcon.onClick} size="20px" padding="10px" />
								</div>
							{/if}
							<div>{title}</div>
						</div>
						<div onpointerdown={e => e.stopPropagation()}>
							<Icon data-testid={testId + '-Modal-close'} img="img/close.svg" colorVariable="--primary-foreground" alt="X" size="20px" padding="10px" onClick={close} />
						</div>
					{/if}
				</div>
				<div class="body">
					{#if $debug}
						params: <code>{JSON.stringify({ params })}</code>
					{/if}
					{#if typeof ModalBody === 'function'}
						<ModalBody {close} {params} />
					{:else if children || top || center || bottom}
						{@render children?.()}
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
					{/if}
				</div>
			{/if}
		</div>
	</Portal>
{/if}
