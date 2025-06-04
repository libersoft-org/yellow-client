<style>
	.top-bar {
		display: flex;
		flex-direction: row;
		position: sticky;
		top: 0;
		align-items: center;
		gap: 24px;
		min-height: calc(var(--menu-height) - 20px);
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
		box-shadow: var(--shadow);
		padding: 10px;

		.left,
		.center,
		.right {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: 10px;
			flex: 1;
			width: 100%;
		}

		.center {
			justify-content: center;
		}

		.right {
			justify-content: end;
		}
	}
</style>

<div class="top-bar">
	<slot />
	<div class="left">
		<slot name="left" />
	</div>
	<div class="center">
		<slot name="center" />
	</div>
	<div class="right">
		<slot name="right" />
	</div>
</div>
