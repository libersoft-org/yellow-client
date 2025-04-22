<script>
 import { Highlight } from 'svelte-highlight';
 import atomOneDark from 'svelte-highlight/styles/atom-one-dark';
 import json from 'svelte-highlight/languages/json';
 import Button from '@/core/components/Button/Button.svelte';
 import { accounts_config } from '../core.js';

 function clickDownload(e) {
  console.log('clickDownload', e);
  let blob = new Blob([JSON.stringify($accounts_config, null, 2)], { type: 'application/json' });
  console.log('blob', blob);
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'accounts_' + new Date().toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, '') + '.json';
  console.log('href', a.href);
  a.click();
  setTimeout(() => {
   URL?.revokeObjectURL(url);
   a?.remove();
  }, 100000);
 }
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

<Button text="Download" onClick={clickDownload} />
<div class="code">
 <div class="sizer">
  <Highlight contenteditable="true" language={json} code={JSON.stringify($accounts_config, null, 2)} />
 </div>
</div>
