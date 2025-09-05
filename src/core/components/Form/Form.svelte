<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		onSubmit: () => void;
		children?: Snippet;
		class?: string;
		width?: string;
		[key: string]: any;
	}
	let { onSubmit, children, class: className = '', width, ...restProps }: Props = $props();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement && event.key === 'Enter') {
			event.preventDefault();
			onSubmit();
		}
	}
</script>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 100%;
	}
</style>

<div class="form {className}" style:width role="none" onkeydown={handleKeyDown} {...restProps}>
	{@render children?.()}
</div>
