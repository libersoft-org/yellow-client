<script lang="ts">
 import { setContext, tick } from 'svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';

 type Props = {
  show?: boolean;
  params?: any;
  title?: string;
  body?: unknown;
  width?: string;
  height?: string;
  onShowChange?: (show: boolean) => void;
  activeTab?: any;
 };

 let { show = $bindable(false), params = {}, title = '', body = null, width, height, onShowChange = () => {}, activeTab = $bindable() }: Props = $props();

 let modalEl = $state(0);
 let posX = 0;
 let posY = 0;
 let isDragging = false;
 let left = $state(0);
 let top = $state(0);
 let showContent = $state(false);

 function setShow(value) {
  if (onShowChange) {
   onShowChange(value);
  } else {
   show = value;
  }
 }

 $effect(() => {
  showUpdated(show);
 });

 async function showUpdated(showing) {
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

 function setTitle(value) {
  title = value;
 }

 setContext('setTitle', setTitle);
 setContext('pageChanged', positionModal);
 setContext('Popup', { close });

 async function positionModal() {
  await tick();
  if (modalEl) {
   const rect = modalEl.getBoundingClientRect();
   top = (window.innerHeight - rect.height) / 2;
   left = (window.innerWidth - rect.width) / 2;
  }
 }

 function close() {
  setShow(false);
 }

 function open() {
  setShow(true);
 }

 function onkeydown(event) {
  if (event.key === 'Escape') {
   event.preventDefault();
   event.stopPropagation();
   setShow(false);
  }
 }

 function dragStart(event) {
  isDragging = true;
  event.preventDefault();
  const rect = modalEl.getBoundingClientRect();
  posX = event.clientX - rect.left;
  posY = event.clientY - rect.top;
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', dragEnd);
 }

 function drag(event) {
  if (!isDragging) return;
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

 // $effect(() => {
 // 	console.log('[Modal] params:', params);
 // });

 $inspect(activeTab);
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
  /* TODO: this works, but it affects initial position */
  /*animation: modalAppear 0.2s ease-out;*/
 }
 /*
    @keyframes modalAppear {
     from {
      transform: scale(0);
     }
     to {
      transform: scale(1);
     }
    }
   */
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
   max-height: 100%;
   max-height: 100%;
   border: 0px;
   border-radius: 0px;
  }
 }
</style>

{#if show}
 <div class="modal" role="none" tabindex="-1" style:top={top && top + 'px'} style:left={left && left + 'px'} style:width={width && width} style:height={height && height} style:max-width={width && width} style:max-height={height && height} bind:this={modalEl} {onkeydown}>
  {#if showContent}
   <div class="header" role="none" tabindex="-1" onmousedown={dragStart}>
    {#if title}
     <div class="title">{title}</div>
     <Icon img="img/close.svg" alt="X" colorVariable="--icon-black" size="20" padding="10" onClick={close} />
    {/if}
   </div>
   <div class="body">
    {@render body({ activeTab })}
   </div>
  {/if}
 </div>
{/if}
