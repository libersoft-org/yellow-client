<script lang="ts">
	import PhotoCardButton from './PhotoCardButton.svelte';
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
		// Limit boundary values
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
			// Swipe right - Yes
			currentX = window.innerWidth;
			setTimeout(() => {
				console.log('Yes');
				onCardRemoved?.();
				currentX = 0; // Reset position for next card
			}, 300);
		} else if (currentX < -threshold) {
			// Swipe left - No
			currentX = -window.innerWidth;
			setTimeout(() => {
				console.log('No');
				onCardRemoved?.();
				currentX = 0; // Reset position for next card
			}, 300);
		} else {
			// Insufficient swipe - return card back
			currentX = 0;
		}
	}

	// Function for handling mouse leave event
	function handleMouseLeave(e) {
		if (isDragging) {
			endSwipe(e);
		}
	}

	function onYes() {
		console.log('Yes');
		// Animate swipe right
		currentX = window.innerWidth;
		setTimeout(() => {
			onCardRemoved?.();
			currentX = 0; // Reset position for next card
		}, 300);
	}

	function onNo() {
		console.log('No');
		// Animate swipe left
		currentX = -window.innerWidth;
		setTimeout(() => {
			onCardRemoved?.();
			currentX = 0; // Reset position for next card
		}, 300);
	}
</script>

<style>
	.photo-card {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
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
		height: 100%;
		object-fit: cover;
		flex: 1;
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
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.overlay-content {
		flex: 1;
		text-align: center;
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

<div class="photo-card {moving ? 'moving' : ''}" style="transform: translateX({currentX}px)" role="button" tabindex="0" ontouchstart={e => startSwipe(e)} ontouchmove={e => moveSwipe(e)} ontouchend={e => endSwipe(e)} onmousedown={e => startSwipe(e)} onmousemove={e => moveSwipe(e)} onmouseup={e => endSwipe(e)} onmouseleave={e => handleMouseLeave(e)}>
	<img src={photo.img} alt={photo.name} />
	<div class="overlay">
		<PhotoCardButton onClick={onNo} />
		<div class="overlay-content">
			<div class="title">{photo.name}</div>
			<div>{photo.description}</div>
		</div>
		<PhotoCardButton isLike onClick={onYes} />
	</div>

	<!-- Swipe indicators -->
	<div class="swipe-indicator like {currentX > threshold ? 'visible' : ''}">👍 LIKE</div>
	<div class="swipe-indicator nope {currentX < -threshold ? 'visible' : ''}">👎 NOPE</div>
</div>
