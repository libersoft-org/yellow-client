<script>
 import { selectedConversation } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from './conversation.svelte';
 
</script>

{#if $selectedConversation === null}
 <Welcome />
{:else}
 <Conversation {selectedConversation} />
{/if}
