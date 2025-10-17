<script lang="ts">
	interface Props {
		moving?: boolean;
		value?: number;
	}
	let { moving = false, value = 0 }: Props = $props();
</script>

<style>
	.progress-bar {
		box-sizing: border-box;
		border: 2px solid var(--default-foreground);
		width: 100%;
		height: 15px;
		box-sizing: border-box;
		background: var(--default-background);
		overflow: hidden;
		position: relative;
		border-radius: 10px;
	}

	.fill {
		height: 100%;
		background: linear-gradient(-45deg, var(--primary-hard-background) 25%, var(--primary-background) 25%, var(--primary-background) 50%, var(--primary-hard-background) 50%, var(--primary-hard-background) 75%, var(--primary-background) 75%, var(--primary-background) 100%);
		background-size: 40px 40px;
		width: 0%;
		transition: width 0.3s ease;
	}

	.moving {
		animation: moveStripes 1s linear infinite;
	}

	@keyframes moveStripes {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 40px 0;
		}
	}
</style>

<div class="progress-bar">
	<div class="fill {moving ? 'moving' : ''}" style="width: {value}%;"></div>
</div>
