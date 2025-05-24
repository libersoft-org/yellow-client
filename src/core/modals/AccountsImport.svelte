<script lang="ts">
 import Button from '../components/Button/Button.svelte';
 import Code from '../components/Code/Code.svelte';
 import { accounts_config } from '../core.js';

 type Props = {
  close: () => void;
 };

 let { close }: Props = $props();

 let text = $state('');

 function accountsConfigImport() {
  if (text) {
   let data = JSON.parse(text);
   accounts_config.set(data);
   close();
  } else {
   console.error('No data to import');
  }
 }
</script>

<style>
 .account-import {
  position: relative;
  max-width: 700px;
  width: 100vw;

  .scrollable {
   overflow: auto;
  }

  :global(.button) {
   margin-top: 10px;
   position: sticky;
   top: 0;
   left: 0;
   z-index: 1;
  }

  textarea {
   padding: 32px;
   letter-spacing: 2.4px;
   position: absolute;
   opacity: 0;
   color: white;
   background-color: black;
   z-index: 1;
   inset: 0;
   max-width: 700px;
  }
 }
</style>

<div class="account-import">
 <div class="scrollable">
  <Code bind:code={text} />
  <textarea bind:value={text} contenteditable="true"></textarea>
 </div>
 <Button img="img/import.svg" text="Import" onClick={accountsConfigImport} />
</div>
