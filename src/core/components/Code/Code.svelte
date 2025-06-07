<script lang="ts">
	interface Props {
		code: string;
	}
	let { code = $bindable() }: Props = $props();
</script>

<style>
	textarea {
		padding: 10px;
		color: var(--secondary-foreground);
		background-color: var(--secondary-background);
		border-width: 0px;
		border-radius: 10px;
	}
</style>

<textarea rows="20" bind:value={code}></textarea>
