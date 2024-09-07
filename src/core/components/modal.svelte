<script>
 export let title;
 export let onClose;

 function clickClose() {
  if (onClose) onClose();
 }

 function keyClose() {
  if (event.key === 'Enter' || event.key === ' ') {
   event.preventDefault();
   clickClose();
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
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  background-color: #fd3;
  color: #000;
 }

 .modal .header .title {
  flex-grow: 1;
 }

 .modal .header .close img {
  width: 20px;
  height: 20px;
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

<div class="modal">
 <div class="header">
  <div class="title">{title}</div>
  <div class="close" role="button" tabindex="0" on:click={clickClose} on:keydown={keyClose}><img src="img/close-black.svg" alt="X" /></div>
 </div>
 <div class="body">
  <slot></slot>
 </div>
</div>
