<script lang="ts">
	interface Props {
		show?: boolean;
		colorVariable?: string;
		size?: string;
	}
	let { show = true, colorVariable = '--primary-foreground', size = '40px' }: Props = $props();
</script>

<style>
	.spinner {
		padding: 10px;
		margin: 0 auto;
		border-radius: 50%;
		background:
			radial-gradient(farthest-side, var(--spinner-color) 94%, transparent) top/8px 8px no-repeat,
			conic-gradient(transparent 30%, var(--spinner-color));
		mask: radial-gradient(farthest-side, transparent calc(100% - 8px), var(--spinner-color) 0);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 8px), var(--spinner-color) 0);
		animation: spinner 1s infinite linear;
	}

	@keyframes spinner {
		100% {
			transform: rotate(1turn);
		}
	}
</style>

{#if show}
	<div class="spinner" style:width={size} style:min-width={size} style:height={size} style:min-height={size} style:--spinner-color="var({colorVariable})"></div>
{/if}
