<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		expand?: boolean;
		align?: 'left' | 'center' | 'right';
		width?: string;
	}
	let { children, expand = false, align = 'left', width }: Props = $props();
</script>

<style>
	.button-bar-wrapper {
		display: flex;
		width: 100%;
	}

	.button-bar-wrapper.align-left {
		justify-content: baseline;
	}

	.button-bar-wrapper.align-center {
		justify-content: center;
	}

	.button-bar-wrapper.align-right {
		justify-content: end;
	}

	.button-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		width: var(--width);
	}

	.button-bar.expand :global(.clickable) {
		flex: 1;
	}
</style>

<div class="button-bar-wrapper" class:align-left={align === 'left'} class:align-center={align === 'center'} class:align-right={align === 'right'}>
	<div class="button-bar" class:expand style={width ? `--width:${width}` : '100%'}>
		{@render children?.()}
	</div>
</div>
