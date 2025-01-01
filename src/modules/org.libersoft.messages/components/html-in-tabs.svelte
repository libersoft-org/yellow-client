<script>
 import Editor from '../components/html-editor.svelte';
 import Preview from '../components/html-editor-preview.svelte';
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 export let text;
 let activeTab = 'editor';

 function setTab(e, name) {
  activeTab = name;
 }
</script>

<style>
 .container {
  border: 1px solid #000;
  border-radius: 10px;
  overflow: auto;
 }
</style>

<div>
 <Tabs>
  <Item label="HTML editor" active={activeTab === 'editor'} onClick={e => setTab(e, 'editor')} />
  <Item label="Preview" active={activeTab === 'preview'} onClick={e => setTab(e, 'preview')} />
 </Tabs>
</div>
<div class="container">
 {#if activeTab === 'editor'}
  <Editor bind:text />
 {:else}
  <Preview {text} />
 {/if}
</div>
