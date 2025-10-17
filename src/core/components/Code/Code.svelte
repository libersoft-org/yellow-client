<script lang="ts">
	interface Props {
		code: string;
		testId?: string;
		blur?: boolean;
	}
	let { code = $bindable(), testId = 'import-textarea', blur = false }: Props = $props();
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
		transition: filter 0.3s ease;
	}

	textarea.blurred {
		filter: blur(8px);
	}
</style>

<textarea bind:value={code} data-testid={testId} class:blurred={blur}></textarea>
