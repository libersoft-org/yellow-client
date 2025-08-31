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

			let currentMarkers: any[] = [];

			// Function to calculate distance between two points
			function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
				const R = 6371; // Earth's radius in km
				const dLat = ((lat2 - lat1) * Math.PI) / 180;
				const dLng = ((lng2 - lng1) * Math.PI) / 180;
				const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				return R * c;
			}

			// Function for clustering based on zoom level
			function updateMarkers() {
				// Clear current markers
				currentMarkers.forEach(marker => map.removeLayer(marker));
				currentMarkers = [];

				const zoom = map.getZoom();

				if (zoom >= 12) {
					// High zoom - show individual markers with photos
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
						const newMarker = L.marker([marker.lat, marker.lng], { icon: customIcon });
						newMarker.addTo(map);
						currentMarkers.push(newMarker);
					});
				} else {
					// Low zoom - show one cluster with all people
					const totalCount = markers.length;

					// Calculate center of all markers
					const centerLat = markers.reduce((sum, m) => sum + m.lat, 0) / totalCount;
					const centerLng = markers.reduce((sum, m) => sum + m.lng, 0) / totalCount;

					// Cluster with count of all people
					const clusterIcon = L.divIcon({
						html: `
							<div style="
								background: #ff6b6b; 
								color: white; 
								border-radius: 50%; 
								width: 50px; 
								height: 50px; 
								display: flex; 
								align-items: center; 
								justify-content: center; 
								font-weight: bold; 
								font-size: 18px;
								box-shadow: 0 2px 8px rgba(0,0,0,0.3);
								border: 3px solid white;
							">
								${totalCount}
							</div>
						`,
						className: 'custom-cluster-marker',
						iconSize: [50, 50],
						iconAnchor: [25, 25],
					});

					const clusterMarker = L.marker([centerLat, centerLng], { icon: clusterIcon });

					// Popup with details of all people
					const popupContent = `
						<div style="text-align: center; max-width: 250px;">
							<h4 style="margin: 0 0 10px 0;">${totalCount} people in area</h4>
							<div style="max-height: 200px; overflow-y: auto;">
								${markers
									.map(
										m => `
									<div style="margin-bottom: 8px; padding: 4px; border-bottom: 1px solid #eee;">
										<img src="${m.photo}" alt="${m.name}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px; margin-right: 8px; vertical-align: middle;" />
										<span style="font-weight: bold;">${m.name}</span>
									</div>
								`
									)
									.join('')}
							</div>
						</div>
					`;

					clusterMarker.bindPopup(popupContent);
					clusterMarker.addTo(map);
					currentMarkers.push(clusterMarker);
				}
			}

			// Event listener for zoom level changes
			map.on('zoomend', updateMarkers);

			// Initialize markers
			updateMarkers();
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
