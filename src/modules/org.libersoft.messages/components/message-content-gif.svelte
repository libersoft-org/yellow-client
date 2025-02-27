<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 import { getContext } from 'svelte';

 let { node } = $props();
 let v = node.attributes.file?.value;

 let messages_context = getContext('MessagesContext');

 async function openExpressions() {
  await messages_context.messageBar?.openExpressions('gifs');
 }
</script>

<style>
 .gif {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
 }
</style>

{#if v}
 <div class="gif">
  <BaseButton onClick={openExpressions}>
   <img src={v} alt="GIF" />
  </BaseButton>
 </div>
{:else}
 error
{/if}
