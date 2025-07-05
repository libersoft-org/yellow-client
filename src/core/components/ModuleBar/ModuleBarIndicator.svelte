<script lang="ts">
	interface Props {
		img?: string;
		alt?: string;
		enabled?: boolean;
	}
	let { img, alt, enabled = false }: Props = $props();
</script>

<style>
	.indicator {
		display: none;
		position: absolute;
		top: 0px;
		right: 0px;
		width: 16px;
		height: 16px;
		padding: 5px;
		border-radius: 50%;
		animation: blink 1s infinite;
	}

	.indicator.enabled {
		display: block;
	}

	@keyframes blink {
		0% {
			opacity: 0;
		}

		30% {
			opacity: 1;
		}

		70% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
</style>

<img class="indicator {enabled && 'enabled'} {enabled && 'enabled'}" src={img} {alt} />
