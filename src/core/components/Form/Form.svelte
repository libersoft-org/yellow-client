<script lang="ts">
	interface Props {
		onSubmit: () => void;
		children: any;
		class?: string;
	}
	let { onSubmit, children, class: className = '' }: Props = $props();

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
	}
</style>

<div class="form {className}" role="none" onkeydown={handleKeyDown}>
	{@render children()}
</div>
