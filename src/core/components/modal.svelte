<script>
 import { tick } from "svelte";

 export let show = false;
 export let params = undefined;
 export let title;
 export let body;

 let modalEl;
 let posX = 0;
 let posY = 0;
 let isDragging = false;
 let left;
 let top;

 function close() {
  show = false;
 }

 function clickCloseModal() {
  close();
 }

 function keyCloseModal(event) {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCloseModal();
  }
 }

 $: update(show);

 async function update(show) {
  if (show) {
   await tick();
   await positionModal();
  }
 }

 async function positionModal() {
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
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: calc(100% - 20px);
  max-height: calc(100% - 20px);
  transform: translate(-50%, -50%);
  border: 1px solid #000;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow);
 }

 .modal .header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: bold;
  background-color: #fd3;
  color: #000;
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
 <div class="modal" style="top: {top}px; left: {left}px;" bind:this={modalEl}>
  <div class="header" role="none" on:mousedown={dragStart}>
   <div class="title">{title}</div>
   <div class="close" role="button" tabindex="0" on:click={clickCloseModal} on:keydown={keyCloseModal}>
    <img src="img/close-black.svg" alt="X" />
   </div>
  </div>
  <div class="body">
   <svelte:component this={body} {params} {close} />
  </div>
 </div>
{/if}
