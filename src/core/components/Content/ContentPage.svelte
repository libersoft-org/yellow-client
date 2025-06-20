<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		align?: 'left' | 'center' | 'right';
	}
	let { children, align = 'left' }: Props = $props();
</script>

<style>
	.content-page {
		display: flex;
		flex: 1;
		height: 100%;
		padding: 10px;
		overflow: auto;
		color: var(--primary-foreground);
	}

	.content-page.align-left {
		justify-content: baseline;
	}

	.content-page.align-center {
		justify-content: center;
	}

	.content-page.align-right {
		justify-content: end;
	}
</style>

<div class="content-page" class:align-left={align === 'left'} class:align-center={align === 'center'} class:align-right={align === 'right'}>
	{@render children?.()}
</div>
