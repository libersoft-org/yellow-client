<script>
 import MessageContent from './MessageContent.svelte';

 export let message_content;

 let message_content_container;

 // ensure message_content_container is thrown away and re-created when message_content changes, because MessageContent modifies it imperatively

 let gen = 0;
 let dummy_array = [];

 $: update(message_content);

 function update(message_content) {
  dummy_array = [message_content];
  gen++;
  console.log('update, message_content:', message_content, 'gen:', gen);
 }
</script>

{#each dummy_array as message_content (gen)}
 {gen}
 {#if message_content.type === 'html'}
  html:
  <div class="text" bind:this={message_content_container}><MessageContent container={message_content_container} node={message_content.body} /></div>
 {:else}
  <div class="text">{@html message_content.body}</div>
 {/if}
{/each}
