<script lang="ts">
	import CardButton from './PhotoCardButton.svelte';
	interface Props {
		photo: {
			img: string;
			name: string;
			description: string;
		};
		// onYes?: (e: Event) => void;
		// onNo?: (e: Event) => void;
	}
	let { photo }: Props = $props();

	let moving = $state(false);
	let startX = 0;
	let currentX = $state(0);
	let threshold = 100;

	function startSwipe(e) {
		moving = true;
		startX = e.touches[0].clientX;
	}

	function moveSwipe(e) {
		currentX = e.touches[0].clientX - startX;
		// We can add effects, for example: transform: translateX(currentX + 'px');
	}

	function endSwipe(e) {
		e.preventDefault();
		e.stopPropagation();
		moving = false;
		if (currentX > threshold) {
			currentX = window.innerWidth;
			setTimeout(onYes, 300);
		} else if (currentX < -threshold) {
			currentX = -window.innerWidth;
			setTimeout(onNo, 300);
		} else {
			currentX = 0;
		}
	}

	function onYes() {
		console.log('Yes');
	}

	function onNo() {
		console.log('No');
	}
</script>

<style>
	.photo-card {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 300px;
		height: 400px;
		border-radius: 10px;
		overflow: hidden;
		touch-action: pan-y;
		transition: transform 0.3s ease-out;
	}

	.photo-card.moving {
		transition: none;
	}

	.photo-card img {
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.photo-card .overlay {
		z-index: 2;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: var(--default-foreground);
		color: var(--default-background);
		padding: 10px;
		text-align: center;
	}

	.card-buttons {
		z-index: 3;
		display: flex;
		width: 100%;
		justify-content: space-around;
		margin-bottom: 10px;
	}

	.overlay .title {
		font-size: 24px;
		font-weight: bold;
		padding-bottom: 10px;
	}
</style>

<div class="photo-card {moving ? 'moving' : ''}" style="transform: translateX({currentX}px)" ontouchstart={e => startSwipe(e)} ontouchmove={e => moveSwipe(e)} ontouchend={e => endSwipe(e)}>
	<img src={photo.img} alt={photo.name} />
	<div class="overlay">
		<div class="title">{photo.name}</div>
		<div>{photo.description}</div>
	</div>
	<div class="card-buttons">
		<CardButton on:click={onNo} content="👎" />
		<CardButton on:click={onYes} content="👍" />
	</div>
</div>
