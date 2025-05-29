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
		background-color: #555;
		color: #fff;
		border-radius: 20px;
	}
</style>

{#if text}
	<div class="section">{text}</div>
{/if}
