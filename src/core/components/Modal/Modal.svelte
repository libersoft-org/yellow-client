<script lang="ts">
 import { setContext, tick, type Snippet } from 'svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import { debug } from '../../core.js';
 import { bringToFront, registerModal, unregisterModal } from '@/lib/modal-index-manager.js';
 import { draggable } from '@neodrag/svelte';
 import Portal from '../Portal/Portal.svelte';

 type Props = {
  show?: boolean;
  params?: any;
  title?: string;
  body?: any;
  width?: string;
  height?: string;
  children?: Snippet;
  breadcrumbs?: Snippet | null;
  onShowChange?: (show: boolean) => void;
 };

 let { show = $bindable(false), children, params, title = '', body = {}, breadcrumbs, width, height, onShowChange = () => {} }: Props = $props();

 let modalEl: HTMLDivElement | null = $state(null);

 let showContent = $state(false);
 let ModalBody = $state<Snippet>(body);
 let zIndex = $state(100);
 let activeTab = $state('');

 let modalId: number;
 let isDragging = false;
 let resizeObserver: ResizeObserver;

 $effect(() => {
  if (modalEl && showContent && !isDragging && activeTab) {
   centerModal();
   requestAnimationFrame(snapTransformIntoBounds);
  }
 });

 $effect(() => {
  showUpdated(show);
  modalId = registerModal(z => (zIndex = z));

  function handleResize() {
   if (!isDragging) requestAnimationFrame(snapTransformIntoBounds);
  }

  if (modalEl) {
   let didInit = false;
   resizeObserver = new ResizeObserver(() => {
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

  const rect = modalEl.getBoundingClientRect();
  const padding = window.innerWidth < 768 ? 12 : 24;

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

  modalEl.style.transition = 'transform 0.2s ease';
  modalEl.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
  setTimeout(() => {
   if (modalEl) modalEl.style.transition = '';
  }, 200);
 }

 export function open() {
  setShow(true);
 }

 export function close() {
  setShow(false);
 }

 function setShow(value: boolean) {
  show = value;
  onShowChange?.(value);
 }

 function clearActiveTab() {
  activeTab = '';
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
  top: 0;
  left: 0;
  max-width: 700px;
  width: 100%;
  max-height: calc(100dvh - 48px);
  border: 1px solid #000;
  border-radius: 10px;
  box-shadow: var(--shadow);
  background-color: #fff;
  overflow: auto;

  @media (max-width: 768px) {
   max-width: calc(100% - 24px) !important;
   max-height: calc(100% - 24px) !important;
   height: fit-content;
   width: 100%;
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
  background-color: var(--color-primary-slightly-lighter);
  color: var(--color-text);  cursor: grab;
 }
 .modal .header .title {
  display: flex;
  align-items: center;
  padding: 0 10px;
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
  /* overflow-y: auto; */
  background-color: #fff;
  color: var(--color-text); }
</style>

{#if show}
 <Portal>
  <div
   class="modal"
   role="none"
   tabindex="-1"
   style:width
   style:height
   style:max-width={width}
   style:max-height={height}
   bind:this={modalEl}
   use:draggable={{
    onDragStart,
    onDragEnd,
    gpuAcceleration: true,
    handle: '.header',
   }}
   style:z-index={zIndex}
   onmousedown={raiseZIndex}
   {onkeydown}
  >
   {#if showContent}
    <div class="header" role="none" tabindex="-1">
     {#if title}
      <div class="title">
       {#if activeTab}
        <Icon img="img/back.svg" alt="Back" colorVariable="--icon-black" size="20px" padding="10px" onClick={clearActiveTab} />
       {/if}
       {title}
      </div>
      <div onpointerdown={e => e.stopPropagation()}>
       <Icon data-testid="Modal-close" img="img/close.svg" alt="X" colorVariable="--icon-black" size="20px" padding="10px" onClick={close} />
      </div>
     {/if}
    </div>
    <div class="body">
     {#if $debug}
      params: <code>{JSON.stringify({ params })}</code>
     {/if}
     {#if typeof ModalBody === 'function'}
      {#if breadcrumbs}
       {@render breadcrumbs()}
      {/if}
      <ModalBody {close} {params} bind:activeTab />
     {:else if children}
      {@render children()}
     {/if}
    </div>
   {/if}
  </div>
 </Portal>
{/if}
