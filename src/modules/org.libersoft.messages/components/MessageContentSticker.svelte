<script>
 import Sticker from './sticker.svelte';

 export let node;
 let v = node.attributes.file?.value;

 //$: console.log('MessageContentSticker node:', v);
</script>

{#if v}
 <Sticker file={v} />
{/if}
