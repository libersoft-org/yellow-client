<script>
	export let moving = false;
	export let value = 0;
</script>

<style>
	.progress-bar {
		width: calc(100% - 6px);
		height: 10px;
		border: 3px solid var(--default-foreground);
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
