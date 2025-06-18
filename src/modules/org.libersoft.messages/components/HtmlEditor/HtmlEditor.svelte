<script>
	import { tick } from 'svelte';
	export let text;
	let elText;

	$: update1(elText);

	async function update1(elText) {
		if (!elText) return;
		await tick();
		elText.focus();
	}
</script>

<style>
	.text {
		width: calc(100% - 22px);
		height: calc(100% - 22px);
		padding: 10px;
		font-family: 'Ubuntu Mono';
		font-size: inherit;
		background-color: var(--default-background);
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
	}
</style>

<textarea class="text" bind:this={elText} bind:value={text} rows="5" cols="30"></textarea>
