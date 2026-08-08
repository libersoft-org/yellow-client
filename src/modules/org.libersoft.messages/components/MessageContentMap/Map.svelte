<script lang="ts">
	import { onMount } from 'svelte';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	interface Props {
		latitude?: string;
		longitude?: string;
	}
	let { latitude, longitude }: Props = $props();
	let map;
	let mapContainer = $state();

	onMount(() => {
		map = L.map(mapContainer).setView([latitude, longitude], 13);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
		L.marker([latitude, longitude]).addTo(map).bindPopup('Random place').openPopup();
	});
</script>

<style>
	.map {
		height: 400px;
		width: 400px;
	}
</style>

{#if latitude && longitude}
	<div class="map" bind:this={mapContainer}></div>
{/if}
