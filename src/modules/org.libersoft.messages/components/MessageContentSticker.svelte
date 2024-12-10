<script>
 import Sticker from './sticker.svelte';

 export let node;
 let v = node.attributes.file?.value;

 //$: console.log('MessageContentSticker node:', v);
</script>

sticker file={v}
{#if v}
 <Sticker file={v} />
{/if}
