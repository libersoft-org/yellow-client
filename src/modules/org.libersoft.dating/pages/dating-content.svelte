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

<svelte:component this={pages[$page]} />
