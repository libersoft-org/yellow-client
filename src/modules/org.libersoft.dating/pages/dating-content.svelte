<script>
 import { page } from '../dating.js';
 import Map from './map.svelte';
 import Match from './match.svelte';
 import People from './people.svelte';
 import Settings from './settings.svelte';

 const pages = {
  map: Map,
  match: Match,
  people: People,
  settings: Settings,
 };
</script>

<style>
 .content {
  height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
  overflow: hidden;
 }
</style>

<div class="content">
 <svelte:component this={pages[$page]} />
</div>
