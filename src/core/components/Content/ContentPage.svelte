<script lang="ts">
	import { type Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
		hAlign?: 'left' | 'center' | 'right';
		vAlign?: 'top' | 'center' | 'bottom';
	}
	let { children, hAlign = 'left', vAlign = 'top' }: Props = $props();
</script>

<style>
	.content-page {
		display: flex;
		align-items: flex-start;
		flex: 1;
		height: 100%;
		padding: 10px;
		overflow: auto;
		color: var(--primary-foreground);
	}

	.content-page.h-align-left {
		justify-content: baseline;
	}

	.content-page.h-align-center {
		justify-content: center;
	}

	.content-page.h-align-right {
		justify-content: end;
	}

	.content-page.v-align-top {
		align-items: baseline;
	}

	.content-page.v-align-center {
		align-items: center;
	}

	.content-page.v-align-bottom {
		align-items: end;
	}
</style>

<div class="content-page" class:h-align-left={hAlign === 'left'} class:h-align-center={hAlign === 'center'} class:h-align-right={hAlign === 'right'} class:v-align-top={vAlign === 'top'} class:v-align-center={vAlign === 'center'} class:v-align-bottom={vAlign === 'bottom'}>
	{@render children?.()}
</div>
