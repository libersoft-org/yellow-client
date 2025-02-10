<script>
 import { identifier, selectedConversation, online } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from '../components/conversation.svelte';
 import Gallery from '../components/gallery.svelte';
</script>

<style>
 .offline {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 20px;
 }
</style>

{#if $online}
 {#if $selectedConversation === null}
  <Welcome />
 {:else}
  <Conversation />
 {/if}
 <Gallery />
{:else}
 <div class="offline">Offline</div>
{/if}
