<script lang="ts">
 import { Highlight } from 'svelte-highlight';
 import atomOneDark from 'svelte-highlight/styles/atom-one-dark';
 import json from 'svelte-highlight/languages/json';

 type Props = {
  code: string;
 };

 let { code = $bindable() }: Props = $props();
</script>

<style>
 :global(.code pre),
 :global(.code code) {
  margin: 0;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 18px;
 }

 .code {
  border: 1px solid #888;
  border-radius: 10px;
  overflow: hidden;
 }

 .sizer {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
 }

 textarea {
  position: absolute;
  inset: 0;
  opacity: 0;
 }
</style>

<svelte:head>
 {@html atomOneDark}
</svelte:head>

<div class="code">
 <div class="sizer">
  <textarea bind:value={code}> </textarea>
  <Highlight language={json} bind:code />
 </div>
</div>
