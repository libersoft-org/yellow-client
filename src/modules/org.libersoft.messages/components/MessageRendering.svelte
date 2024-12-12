<script>
 import MessageContent from './MessageContent.svelte';

 export let message_content;

 let message_content_container;
</script>

{#if message_content.type === 'html'}
 <div class="text" bind:this={message_content_container}><MessageContent container={message_content_container} node={message_content.body} /></div>
{:else}
 <div class="text">{@html message_content.body}</div>
{/if}
