<script lang="ts">
	import { getContext } from 'svelte';
	import { identifier } from '@/org.libersoft.messages/scripts/messages.js';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import HtmlSideBySide from '@/org.libersoft.messages/components/HtmlEditor/HtmlSideBySide.svelte';
	import HtmlInTabs from '@/org.libersoft.messages/components/HtmlEditor/HtmlInTabs.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
	const MessageBar = getContext('MessageBar') as { sendMessageHtml: (text: string) => void } | undefined;
	let text = $state('');
	let isSideBySide = $state(true);

	function send() {
		console.log('send');
		MessageBar?.sendMessageHtml(text);
		close();
	}
</script>

<style>
	.html {
		display: flex;
		flex-direction: column;
		gap: 10px;
		height: 100%;
	}
</style>

<div class="html">
	<Switch showLabel label="Show editor and preview side by side" bind:checked={isSideBySide} />
	{#if isSideBySide}
		<HtmlSideBySide bind:text />
	{:else}
		<HtmlInTabs bind:text />
	{/if}
	<Button img="modules/{identifier}/img/send.svg" text="Send" right onClick={send} />
</div>
