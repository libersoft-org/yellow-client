<script>
 import { md } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from '../components/conversation.svelte';

 let selectedConversation;
 $: selectedConversation = $md.selectedConversation;

</script>

{#if $selectedConversation === null}
 <Welcome />
{:else}
 <Conversation {selectedConversation} />
{/if}
