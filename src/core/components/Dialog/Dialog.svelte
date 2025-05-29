<script>
 import Modal from '../Modal/Modal.svelte';
 import Button from '@/core/components/Button/Button.svelte';
 import Icon from '../Icon/Icon.svelte';

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
  flex-wrap: wrap;
  gap: 10px;
  width: fit-content;

  :global(.base-button) {
   width: fit-content;
  }

  /* .button {
      width: fit-content;
    } */
 }

 .top {
  display: flex;
  gap: 20px;
  padding: 10px;
 }
</style>

<Modal title={data.title} bind:show width="400px">
 <div class="top">
  {#if data.icon}
   <Icon img={data.icon} alt="" size="50px" padding="0px" />
  {/if}
  <div>{data.body}</div>
 </div>
 <div class="buttons">
  {#each data.buttons as button}
   <Button {...button} width="100%" />
  {/each}
 </div>
 <!-- <Button text="Close" onClick={() => (show = false)} /> -->
</Modal>
