<script lang="ts">
 import { setContext, tick, type Snippet } from 'svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import { debug } from '../../core.js';
 import { bringToFront, registerModal, unregisterModal } from '@/lib/modal-index-manager.js';

 type Props = {
  show?: boolean;
  params?: any;
  title?: string;
  body?: any;
  width?: string;
  height?: string;
  children?: Snippet;
  onShowChange?: (show: boolean) => void;
 };

 let { show = $bindable(false), children, params, title = '', body = null, width, height, onShowChange = () => {} }: Props = $props();

 let modalEl: HTMLDivElement | null = $state(null);
 let showContent = $state(false);
 let zIndex = $state(100);
 let modalId: number;
 let posX = 0,
  posY = 0,
  isDragging = false;
 let left = $state(0),
  top = $state(0);

 function setShow(value: boolean) {
  show = value;
  onShowChange?.(value);
 }

 $effect(() => {
  showUpdated(show);
  modalId = registerModal(z => (zIndex = z));
  return () => unregisterModal(modalId);
 });

 function raiseZIndex() {
  bringToFront(modalId);
 }

 async function showUpdated(showing: boolean) {
  if (showing) {
   await tick();
   modalEl?.focus();
   showContent = true;
   await tick();
   await positionModal();
  } else {
   showContent = false;
  }
 }

 function setTitle(value: string) {
  title = value;
 }

 setContext('setTitle', setTitle);
 setContext('pageChanged', positionModal);
 setContext('Popup', { close });

 async function positionModal() {
  await tick();
  if (!modalEl) return;
  const rect = modalEl.getBoundingClientRect();
  top = (window.innerHeight - rect.height) / 2;
  left = (window.innerWidth - rect.width) / 2;
 }

 export function close() {
  setShow(false);
 }
 export function open() {
  setShow(true);
 }

 function onkeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
   event.preventDefault();
   event.stopPropagation();
   close();
  }
 }

 function dragStart(event: MouseEvent) {
  isDragging = true;
  event.preventDefault();
  const rect = modalEl?.getBoundingClientRect();
  if (!rect) return;
  posX = event.clientX - rect.left;
  posY = event.clientY - rect.top;
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', dragEnd);
 }

 function drag(event: MouseEvent) {
  if (!isDragging || !modalEl) return;
  const x = event.clientX - posX;
  const y = event.clientY - posY;
  const modalWidth = modalEl.offsetWidth;
  const modalHeight = modalEl.offsetHeight;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  left = Math.max(0, Math.min(windowWidth - modalWidth, x));
  top = Math.max(0, Math.min(windowHeight - modalHeight, y));
 }

 function dragEnd() {
  isDragging = false;
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', dragEnd);
 }

 $inspect(params);
</script>

<style>
 .modal {
  z-index: 100;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  max-width: 100vw;
  max-height: 100vh;
  overflow: auto;
  border: 1px solid #000;
  border-radius: 10px;
  box-shadow: var(--shadow);
  background-color: #fff;
 }
 .modal .header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  background-color: #fd3;
  color: #000;
  cursor: pointer;
 }
 .modal .header .title {
  padding: 0 10px;
  flex-grow: 1;
 }
 .modal .body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
  background-color: #fff;
  color: #000;
 }
 @media (max-width: 768px) {
  .modal {
   min-width: 100%;
   min-height: 100%;
   width: 100%;
   height: 100%;
   border: 0px;
   border-radius: 0px;
  }
 }
</style>

{#if show}
 <div class="modal" role="none" tabindex="-1" style:top={top ? `${top}px` : undefined} style:left={left ? `${left}px` : undefined} style:width style:height style:max-width={width} style:max-height={height} bind:this={modalEl} style:z-index={zIndex} onmousedown={raiseZIndex} {onkeydown}>
  {#if showContent}
   <div class="header" role="none" tabindex="-1" onmousedown={dragStart}>
    {#if title}
     <div class="title">{title}</div>
     <Icon data-testid="Modal-close" img="img/close.svg" alt="X" colorVariable="--icon-black" size={20} padding={10} onClick={close} />
    {/if}
   </div>
   <div class="body">
    {@render children?.()}

    {#if $debug}
     params: <code>{JSON.stringify({ params })}</code>
    {/if}

    {#if params}
     {JSON.stringify({ params })}
     {@render body({ close, params: params })}
    {:else}
     {@render body({ close })}
    {/if}
   </div>
  {/if}
 </div>
{/if}
