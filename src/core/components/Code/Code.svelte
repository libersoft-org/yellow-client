<script>
 import { Highlight } from 'svelte-highlight';
 import atomOneDark from 'svelte-highlight/styles/atom-one-dark';
 import json from 'svelte-highlight/languages/json';
 export let code = '';
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
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
 }
</style>

<svelte:head>
 {@html atomOneDark}
</svelte:head>

<div class="code">
 <div class="sizer">
  <Highlight contenteditable="true" language={json} {code} />
 </div>
</div>
