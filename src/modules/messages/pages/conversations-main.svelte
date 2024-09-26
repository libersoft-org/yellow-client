<script>
 import { selectedConversation } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from '../components/conversation.svelte';

 export let account;

</script>

{#if $selectedConversation === null}
 <Welcome />
{:else}
 <Conversation {selectedConversation} />
{/if}
