<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setModule } from '@/core/scripts/core.ts';
	import { selectedConversation, closeConversation } from '@/org.libersoft.messages/scripts/messages.js';
	import Welcome from '@/org.libersoft.messages/pages/Welcome/Welcome.svelte';
	import Conversation from '@/org.libersoft.messages/components/Conversation/Conversation.svelte';
	import Gallery from '@/org.libersoft.messages/components/Gallery/Gallery.svelte';

	onMount(() => {
		window.addEventListener('keydown', onKeydown);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown);
	});

	function onKeydown(event) {
		if (event.key === 'Escape') {
			if ($selectedConversation) closeConversation();
			else setModule(null);
		}
	}
</script>

{#if $selectedConversation === null}
	<Welcome />
{:else}
	<Conversation />
{/if}
<Gallery />
