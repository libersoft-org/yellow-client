<script lang="ts">
	import { module } from '@/org.libersoft.dating/scripts/module.ts';
	import { type IPhotoCard } from '@/org.libersoft.dating/scripts/photocards.ts';
	import PhotoCard from './PhotoCard.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';

	function generateMockCards(): IPhotoCard[] {
		return [
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
		];
	}

	let photos: IPhotoCard[] = $state(generateMockCards());
	let isLoading = $state(false);

	function removeTopCard() {
		if (photos.length > 0) {
			photos = photos.slice(1);
			// If cards run out, load new ones
			if (photos.length === 0) reloadCards();
		}
	}

	async function reloadCards() {
		isLoading = true;
		// Simulation of data loading (in real app this would be an API call)
		await new Promise(resolve => setTimeout(resolve, 1000));
		// Load new cards
		photos = generateMockCards();
		isLoading = false;
	}
</script>

<style>
	.photo-cards-container {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		perspective: 1000px;
	}

	.card-stack {
		position: relative;
		aspect-ratio: 3/4;
		/* Card will adapt to the smaller of these values */
		width: min(100%, 75vh);
		height: min(100%, 133.33vw);
	}

	.card-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.spinner-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}
</style>

<div class="photo-cards-container">
	<div class="card-stack">
		{#if isLoading}
			<div class="spinner-container">
				<Spinner size="40px" />
			</div>
		{:else if photos.length > 0}
			{#each photos as photo, index (photo.name + index)}
				<div class="card-wrapper" style="z-index: {photos.length - index}">
					<PhotoCard {photo} onCardRemoved={removeTopCard} />
				</div>
			{/each}
		{:else}
			<div class="spinner-container">
				<p>No more cards to display</p>
			</div>
		{/if}
	</div>
</div>
