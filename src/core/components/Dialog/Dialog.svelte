<script>
 import Modal from '../Modal/Modal.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 export let data;
 let show = false;

 export function open() {
  show = true;
 }

 export function close() {
  show = false;
 }
</script>

<style>
 .buttons {
  display: flex;
  gap: 10px;
 }

 .top {
  display: flex;
  gap: 20px;
  padding: 10px;
 }

 .top .icon img {
  width: 50px;
  height: 50px;
 }
</style>

<Modal title={data.title} bind:show width="400px">
 <slot>
  <div class="top">
   <div class="icon"><img src={data.icon} alt="icon" /></div>
   <div>{data.body}</div>
  </div>
  <div class="buttons">
   {#each data.buttons as button}
    <Button {...button} />
   {/each}
  </div>
  <!--<Button text="Close" onClick={() => (show = false)} />-->
 </slot>
</Modal>
