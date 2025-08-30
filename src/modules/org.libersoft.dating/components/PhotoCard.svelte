<script lang="ts">
	import CardButton from './PhotoCardButton.svelte';
	import { type IPhotoCard } from '@/org.libersoft.dating/scripts/photocards.ts';
	interface Props {
		photo: IPhotoCard;
		onCardRemoved?: () => void;
	}
	let { photo, onCardRemoved }: Props = $props();
	let moving = $state(false);
	let startX = 0;
	let currentX = $state(0);
	let threshold = 100;
	let isDragging = $state(false);

	function startSwipe(e) {
		moving = true;
		isDragging = true;
		startX = e.touches ? e.touches[0].clientX : e.clientX;
		e.preventDefault();
	}

	function moveSwipe(e) {
		if (!isDragging) return;
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		currentX = clientX - startX;
		// Ošetření hraničních hodnot
		if (currentX > window.innerWidth / 2) currentX = window.innerWidth / 2;
		if (currentX < -window.innerWidth / 2) currentX = -window.innerWidth / 2;
		e.preventDefault();
	}

	function endSwipe(e) {
		if (!isDragging) return;
		e.preventDefault();
		e.stopPropagation();
		moving = false;
		isDragging = false;
		if (currentX > threshold) {
			// Swipe doprava - Ano
			currentX = window.innerWidth;
			setTimeout(() => {
				onYes();
				currentX = 0; // Reset pozice pro příští kartu
			}, 300);
		} else if (currentX < -threshold) {
			// Swipe doleva - Ne
			currentX = -window.innerWidth;
			setTimeout(() => {
				onNo();
				currentX = 0; // Reset pozice pro příští kartu
			}, 300);
		} else {
			// Nedostatečný swipe - vrátit kartu zpět
			currentX = 0;
		}
	}

	// Funkce pro handling mouse leave události
	function handleMouseLeave(e) {
		if (isDragging) {
			endSwipe(e);
		}
	}

	function onYes() {
		console.log('Yes');
		onCardRemoved?.();
	}

	function onNo() {
		console.log('No');
		onCardRemoved?.();
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
		cursor: grab;
		user-select: none;
	}

	.photo-card.moving {
		transition: none;
		cursor: grabbing;
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

	.swipe-indicator {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 48px;
		font-weight: bold;
		opacity: 0;
		transition: opacity 0.2s ease-out;
		z-index: 4;
		pointer-events: none;
	}

	.swipe-indicator.like {
		right: 20px;
		color: #4caf50;
	}

	.swipe-indicator.nope {
		left: 20px;
		color: #f44336;
	}

	.swipe-indicator.visible {
		opacity: 1;
	}
</style>

<div class="photo-card {moving ? 'moving' : ''}" style="transform: translateX({currentX}px)" ontouchstart={e => startSwipe(e)} ontouchmove={e => moveSwipe(e)} ontouchend={e => endSwipe(e)} onmousedown={e => startSwipe(e)} onmousemove={e => moveSwipe(e)} onmouseup={e => endSwipe(e)} onmouseleave={e => handleMouseLeave(e)}>
	<img src={photo.img} alt={photo.name} />
	<div class="overlay">
		<div class="title">{photo.name}</div>
		<div>{photo.description}</div>
	</div>
	<div class="card-buttons">
		<CardButton onClick={onNo} content="👎" />
		<CardButton onClick={onYes} content="👍" />
	</div>

	<!-- Swipe indikátory -->
	<div class="swipe-indicator like {currentX > threshold ? 'visible' : ''}">👍 LIKE</div>
	<div class="swipe-indicator nope {currentX < -threshold ? 'visible' : ''}">👎 NOPE</div>
</div>
