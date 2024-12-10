<script>
 import { onMount } from 'svelte';
 import L from 'leaflet';
 import 'leaflet/dist/leaflet.css';

 export let latitude;
 export let longitude;

 let map;
 let mapContainer;

 onMount(() => {
  map = L.map(mapContainer).setView([latitude, longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([latitude, longitude]).addTo(map).bindPopup('Random place').openPopup();
 });
</script>

<style>
 .map {
  height: 100%;
  width: 100%;
 }
</style>

{#if latitude && longitude}
 <div class="map" bind:this={mapContainer}></div>
{/if}
