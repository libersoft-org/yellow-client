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
			const markers = [
				{
					lat: parseFloat(myCoordinates.latitude) + 0.01,
					lng: parseFloat(myCoordinates.longitude) + 0.01,
					photo: '/modules/org.libersoft.dating/img/photos/1.webp',
					name: 'Name 1',
				},
				{
					lat: parseFloat(myCoordinates.latitude) - 0.008,
					lng: parseFloat(myCoordinates.longitude) + 0.015,
					photo: '/modules/org.libersoft.dating/img/photos/2.webp',
					name: 'Name 2',
				},
				{
					lat: parseFloat(myCoordinates.latitude) + 0.005,
					lng: parseFloat(myCoordinates.longitude) - 0.012,
					photo: '/modules/org.libersoft.dating/img/photos/3.webp',
					name: 'Name 3',
				},
			];
			markers.forEach(marker => {
				const customIcon = L.divIcon({
					html: `
						<div style="text-align: center; background: white; border-radius: 12px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid #fff;">
							<img src="${marker.photo}" alt="${marker.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; display: block; margin: 0 auto 4px;" />
							<div style="font-size: 12px; font-weight: bold; color: #333; white-space: nowrap;">${marker.name}</div>
						</div>
					`,
					className: 'custom-photo-marker',
					iconSize: [70, 80],
					iconAnchor: [35, 40],
				});
				L.marker([marker.lat, marker.lng], { icon: customIcon }).addTo(map);
			});
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
