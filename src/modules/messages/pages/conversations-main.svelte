<script>
 import { selectedConversation } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from '../components/conversation.svelte';
</script>

{#if $selectedConversation === null}
 <Welcome />
{:else}
 <Conversation />
{/if}
