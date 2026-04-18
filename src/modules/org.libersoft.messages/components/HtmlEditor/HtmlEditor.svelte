<script lang="ts">
	import { tick } from 'svelte';
	interface Props {
		text: string;
	}
	let { text = $bindable() }: Props = $props();
	let elText: HTMLTextAreaElement;

	let _focusOnMount = $derived.by((): boolean => {
		if (elText) tick().then(() => elText.focus());
		return true;
	});
</script>

<style>
	.text {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 10px;
		font-family: 'Ubuntu Mono';
		font-size: inherit;
		background-color: var(--default-background);
		border: 1px solid var(--default-foreground);
		border-radius: 10px;
	}
</style>

<textarea class="text" bind:this={elText} bind:value={text} data-focused={_focusOnMount || undefined}></textarea>
