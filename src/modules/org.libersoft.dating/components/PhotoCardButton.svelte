<script lang="ts">
	interface Props {
		isLike: boolean;
		onClick: () => void;
	}
	let { isLike = false, onClick }: Props = $props();

	const content = isLike ? '👍' : '👎';
	const type = isLike ? 'like' : 'nope';
</script>

<style>
	.overlay-button {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		cursor: pointer;
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	.overlay-button:hover {
		transform: scale(1.1);
	}

	.overlay-button.like {
		background-color: #080;
	}

	.overlay-button.nope {
		background-color: #f00;
	}
</style>

<button class="overlay-button {type}" onclick={onClick}>
	{content}
</button>
