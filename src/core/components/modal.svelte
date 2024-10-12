<script>
 export let show = false;
 export let params = undefined;
 export let title;
 export let body;

 function close() {
  show = false;
 }

 let props = {params, close};

 function clickCloseModal() {
  show = false;
 }

 function keyCloseModal() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickCloseModal();
  }
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
 <div class="modal">
  <div class="header">
   <div class="title">{title}</div>
   <div class="close" role="button" tabindex="0" on:click={clickCloseModal} on:keydown={keyCloseModal}>
    <img src="img/close-black.svg" alt="X" />
   </div>
  </div>
  <div class="body">
   <svelte:component this={body} bind:show bind:title {...props} />
  </div>
 </div>
{/if}
