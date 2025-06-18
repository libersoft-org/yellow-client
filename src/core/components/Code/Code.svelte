<script lang="ts">
	interface Props {
		code: string;
		testId?: string;
	}
	let { code = $bindable(), testId = 'import-textarea' }: Props = $props();
</script>

<style>
	textarea {
		width: calc(100% - 20px);
		padding: 10px;
		color: var(--secondary-foreground);
		background-color: var(--secondary-background);
		border-width: 0px;
		border-radius: 10px;
		font-family: 'Ubuntu Mono';
		font-size: inherit;
	}
</style>

<textarea rows="20" bind:value={code} data-testid={testId}></textarea>
