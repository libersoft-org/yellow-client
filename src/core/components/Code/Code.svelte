<script lang="ts">
 import { SimpleCodeEditor } from 'svelte-simple-code-editor';
 import Prism from 'prismjs';
 import 'prismjs/themes/prism-tomorrow.css';
 import 'prismjs/components/prism-json';

 type Props = {
  code: string;
 };

 let { code = $bindable() }: Props = $props();
</script>

<style>
 .code {
  border: 1px solid #888;
  border-radius: 10px;
  overflow: hidden;
 }

 :global(.code .language-json) {
  background-color: #1e1e1e !important;
  max-width: 500px;
  width: 100vw;
 }

 :global(.code textarea) {
  caret-color: white !important;
 }
</style>

<div class="code">
 <SimpleCodeEditor bind:value={code} highlight={code => Prism.highlight(code, Prism.languages.json, 'json')} preClass="language-json" />
</div>
