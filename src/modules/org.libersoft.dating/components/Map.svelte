<script lang="ts">
	import { onMount } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	interface ICoordinates {
		latitude: string;
		longitude: string;
	}
	let myCoordinates: ICoordinates = $state({
		latitude: '50.0755',
		longitude: '14.4378',
	});
	let map: any;
	let mapContainer = $state();

	onMount(() => {
		if (mapContainer && myCoordinates.latitude && myCoordinates.longitude) {
			map = L.map(mapContainer).setView([parseFloat(myCoordinates.latitude), parseFloat(myCoordinates.longitude)], 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
			}).addTo(map);
			L.marker([parseFloat(myCoordinates.latitude), parseFloat(myCoordinates.longitude)])
				.addTo(map)
				.bindPopup('Your location')
				.openPopup();
		}
	});
</script>

<style>
	.map {
		height: 100%;
		width: 100%;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}
</style>

{#if myCoordinates.latitude && myCoordinates.longitude}
	<div class="map" bind:this={mapContainer}></div>
{:else}
	<div class="loading">
		<Spinner size="100px" />
	</div>
{/if}
