<script>
 import { selectedConversation } from '../messages.js';
 import Welcome from './welcome.svelte';
 import Conversation from '../components/conversation.svelte';
 import Gallery from '../components/gallery.svelte';
</script>

{#if $selectedConversation === null}
 <Welcome />
{:else}
 <Conversation />
{/if}
<Gallery />
