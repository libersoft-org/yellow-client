<script>
 import { sticker_servers } from '../stickers.js';
 import Button from '../../../core/components/button.svelte';

 export let close;
 export let params;

 function add() {
  sticker_servers.update(x => {
   x.push('https://stickers.libersoft.org');
   return x;
  });
 }
</script>

<Button text="Defaults" onClick={() => sticker_servers.set(['https://stickers.libersoft.org'])} />
<Button text="Add" onClick={add} />

{#each $sticker_servers as s}
 <div>{s}</div>
{/each}
