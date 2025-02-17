<script>
 import { identifier, online } from '../messages.js';
 import Button from '../../../core/components/button.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalConversationNew from '../modals/conversation-new.svelte';
 const illustrations = ['man', 'woman', 'pigeon'];
 let showNewConversationModal = false;

 function clickNew() {
  showNewConversationModal = true;
 }

 import { longpress } from '../ui.js';

 let pressed;
</script>

<style>
 .welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }

 .welcome .illustration {
  width: 350px;
  max-width: (100% - 20px);
  height: 350px;
  max-height: (100% - 20px);
 }

 .welcome .label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid #fd1;
  border-radius: 20px;
  text-align: center;
  font-size: 20px;
  background-color: rgba(255, 221, 17, 0.3);
 }
</style>

<div class="welcome">
 <!-- <div use:longpress on:longpress="{e => pressed = true}">-->
 <!--  longpress me-->
 <!-- </div>-->
 <!-- <br/>-->
 <!-- <button use:longpress={2000} on:longpress="{e => pressed = true}">-->
 <!--  longpress me (for two seconds)-->
 <!-- </button>-->
 <!-- <br/>-->
 <!-- <button on:click="{() => pressed = false}">-->
 <!--  reset-->
 <!-- </button>-->
 <!-- <br/>-->
 <!-- {#if pressed}-->
 <!--  <p>-->
 <!--   a button was longpressed-->
 <!--  </p>-->
 <!-- {:else}-->
 <!--  <p>-->
 <!--   press one of the buttons-->
 <!--  </p>-->
 <!-- {/if}-->

 <img class="illustration" src="modules/{identifier}/img/illustration_{illustrations[Math.floor(Math.random() * illustrations.length)]}.svg" alt="Illustration" />
 <div class="label">
  {#if $online}
   <div>Select your conversation<br />or</div>
   <Button text="Start a new one" padding="5px" onClick={clickNew} />
  {:else}
   <div>This module is offline</div>
  {/if}
 </div>
</div>
<Modal title="New Conversation" body={ModalConversationNew} bind:show={showNewConversationModal} />
