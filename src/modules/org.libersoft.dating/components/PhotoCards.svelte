<script lang="ts">
	import { module } from '@/org.libersoft.dating/scripts/module.ts';
	import { type IPhotoCard } from '@/org.libersoft.dating/scripts/photocards.ts';
	import PhotoCard from './PhotoCard.svelte';

	let photos: IPhotoCard[] = $state([
		{
			img: 'modules/' + module.identifier + '/img/photos/1.webp',
			name: 'Name 1',
			description: 'Description 1',
		},
		{
			img: 'modules/' + module.identifier + '/img/photos/2.webp',
			name: 'Name 2',
			description: 'Description 2',
		},
		{
			img: 'modules/' + module.identifier + '/img/photos/3.webp',
			name: 'Name 3',
			description: 'Description 3',
		},
	]);

	function removeTopCard() {
		if (photos.length > 0) {
			photos = photos.slice(1);
		}
	}
</script>

<style>
	.photo-cards-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 500px;
		perspective: 1000px;
	}

	.card-stack {
		position: relative;
		width: 300px;
		height: 400px;
	}

	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform-origin: center bottom;
		transition: transform 0.3s ease-out;
	}

	.card-wrapper:nth-child(1) {
		z-index: 3;
		transform: scale(1) translateY(0px);
	}

	.card-wrapper:nth-child(2) {
		z-index: 2;
		transform: scale(0.95) translateY(10px);
		filter: brightness(0.9);
	}

	.card-wrapper:nth-child(3) {
		z-index: 1;
		transform: scale(0.9) translateY(20px);
		filter: brightness(0.8);
	}

	.card-wrapper:nth-child(n + 4) {
		display: none;
	}
</style>

<div class="photo-cards-container">
	<div class="card-stack">
		{#each photos as photo, index (photo.name + index)}
			<div class="card-wrapper">
				<PhotoCard {photo} onCardRemoved={removeTopCard} />
			</div>
		{/each}
	</div>
</div>
