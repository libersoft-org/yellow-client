<script>
 import { selectedConversation } from '../../messages.js';
 import WelcomePage from '../WelcomePage/WelcomePage.svelte';
 import Conversation from '../../components/Conversation/Conversation.svelte';
 import Gallery from '@/org.libersoft.messages/components/Gallery/Gallery.svelte';
</script>

{#if $selectedConversation === null}
 <WelcomePage />
{:else}
 <Conversation />
{/if}
<Gallery />
