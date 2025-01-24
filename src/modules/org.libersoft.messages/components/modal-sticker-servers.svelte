<script>
 import { sticker_servers } from '../stickers.js';
 import Button from '../../../core/components/button.svelte';
 import Select from '../../../core/components/select.svelte';
 import Option from '../../../core/components/select-option.svelte';
 //export let close;
 //export let params;

 function add(url) {
  sticker_servers.update(servers => {
   servers.push(url);
   return servers;
  });
 }
</script>

<Button text="Defaults" onClick={() => sticker_servers.set(['https://stickers.libersoft.org'])} />
<Button text="Add" onClick={add} />

<Select>
 {#each $sticker_servers as s}
  <Option value={s} text={s} />
 {/each}
</Select>
