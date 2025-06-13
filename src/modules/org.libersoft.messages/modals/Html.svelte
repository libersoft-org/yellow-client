<script>
	import { getContext } from 'svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import HtmlSideBySide from '../components/HtmlEditor/HtmlSideBySide.svelte';
	import HtmlInTabs from '../components/HtmlEditor/HtmlInTabs.svelte';
	export let close;
	const MessageBar = getContext('MessageBar');
	let text = '';
	let isSideBySide = true;

	function send() {
		console.log('send');
		MessageBar.sendMessageHtml(text);
		close();
	}
</script>

<style>
	.html {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 800px;
		height: 480px;
	}

	.switch {
		display: flex;
		align-items: center;
		gap: 10px;
	}
</style>

<div class="html" data-testid="html-composer-modal">
	<div class="switch" data-testid="html-composer-layout-switch">
		<Switch bind:checked={isSideBySide} data-testid="html-composer-layout-toggle" />
		<div>Show editor and preview side by side</div>
	</div>
	{#if isSideBySide}
		<HtmlSideBySide bind:text />
	{:else}
		<HtmlInTabs bind:text />
	{/if}
	<Button text="Send" onClick={send} data-testid="html-composer-send-button" />
</div>
