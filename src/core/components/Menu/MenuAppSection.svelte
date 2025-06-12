<script>
	export let text;
</script>

<style>
	.section {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px;
		font-weight: bold;
		background-color: var(--disabled-background);
		color: var(--disabled-foreground);
		border-radius: 20px;
	}
</style>

{#if text}
	<div class="section">{text}</div>
{/if}
