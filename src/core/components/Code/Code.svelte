<script lang="ts">
	interface Props {
		code: string;
		testId?: string;
	}
	let { code = $bindable(), testId = 'import-textarea' }: Props = $props();
</script>

<style>
	textarea {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 10px;
		color: var(--secondary-foreground);
		background-color: var(--secondary-background);
		border-width: 0px;
		border-radius: 10px;
		font-family: 'Ubuntu Mono';
		font-size: inherit;
	}
</style>

<textarea bind:value={code} data-testid={testId}></textarea>
