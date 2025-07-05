<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setModule } from '@/core/core.ts';
	import { selectedConversation, closeConversation } from '../../messages.js';
	import Welcome from '../Welcome/Welcome.svelte';
	import Conversation from '../../components/Conversation/Conversation.svelte';
	import Gallery from '../../components/Gallery/Gallery.svelte';

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
