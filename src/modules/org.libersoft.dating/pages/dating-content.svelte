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
 .dating-content {
  height: 100vh;
  max-height: 100vh;
  background: url('/img/background.webp') repeat;
  background-size: 400px;
 }
</style>

<div class="dating-content">
 <svelte:component this={pages[$page]} />
</div>
