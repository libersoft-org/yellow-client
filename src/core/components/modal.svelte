<script>
 import { debug } from '../core.js';
 import { setContext, tick } from 'svelte';
 import BaseButton from './base-button.svelte';
 export let show = false;
 export let params = null;
 export let title = null;
 export let body = '';
 export let width = 'calc(100% - 20px)';
 export let height = 'calc(100% - 20px)';
 let modalEl;
 let posX = 0;
 let posY = 0;
 let isDragging = false;
 let left;
 let top;

 function setTitle(value) {
  title = value;
 }

 setContext('setTitle', setTitle);
 setContext('pageChanged', positionModal);
 setContext('Popup', {
  close,
 });

 $: onShowUpdated(show);

 async function onShowUpdated(show) {
  //console.log('update', show);
  if (show) await positionModal();
 }

 async function positionModal() {
  console.log('positionModal');
  await tick();
  if (modalEl) {
   const modalRect = modalEl.getBoundingClientRect();
   const modalWidth = modalRect.width;
   const modalHeight = modalRect.height;
   const windowWidth = window.innerWidth;
   const windowHeight = window.innerHeight;
   top = (windowHeight - modalHeight) / 2;
   left = (windowWidth - modalWidth) / 2;
  }
 }

 function close() {
  show = false;
 }

 function clickCloseModal() {
  show = false;
 }

 function onkeydown(event) {
  if (event.key === 'Escape') {
   event.preventDefault();
   event.stopPropagation();
   show = false;
  }
 }

 function dragStart(event) {
  isDragging = true;
  event.preventDefault();
  const modalRect = modalEl.getBoundingClientRect();
  posX = event.clientX - modalRect.left;
  posY = event.clientY - modalRect.top;
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', dragEnd);
 }

 function drag(event) {
  if (isDragging) {
   let x = event.clientX - posX;
   let y = event.clientY - posY;
   const modalWidth = modalEl.offsetWidth;
   const modalHeight = modalEl.offsetHeight;
   const windowWidth = window.innerWidth;
   const windowHeight = window.innerHeight;
   left = Math.max(0, Math.min(windowWidth - modalWidth, x));
   top = Math.max(0, Math.min(windowHeight - modalHeight, y));
  }
 }

 function dragEnd() {
  isDragging = false;
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', dragEnd);
 }
</script>

<style>
 .modal {
  z-index: 100;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  /*max-width: calc(100% - 20px);
  max-height: calc(100% - 20px);*/
  overflow: auto;
  border: 1px solid #000;
  border-radius: 10px;
  /*box-sizing: border-box;*/
  box-shadow: var(--shadow);
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

 .modal .header img {
  display: block;
  width: 20px;
  height: 20px;
  padding: 10px;
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
</style>

{#if show && body}
 <div class="modal" role="none" style="top: {top}px; left: {left}px; max-width: {width}; max-height: {height};" bind:this={modalEl} on:keydown={onkeydown}>
  <div class="header" role="none" on:mousedown={dragStart}>
   <div class="title">{title}</div>
   <BaseButton onClick={clickCloseModal}>
    <div class="close">
     <img src="img/close-black.svg" alt="X" />
    </div>
   </BaseButton>
  </div>
  <div class="body">
   {#if $debug}params: <code>{JSON.stringify({ params })}</code>{/if}
   {#if params}
    <svelte:component this={body} {close} {params} />
   {:else}
    <svelte:component this={body} {close} />
   {/if}
  </div>
 </div>
{/if}
