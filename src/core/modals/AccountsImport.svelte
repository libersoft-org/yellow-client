<script lang="ts">
 import Button from '../components/Button/Button.svelte';
 import Code from '../components/Code/Code.svelte';
 import { accounts_config } from '../core.js';

 type Props = {
  close: () => void;
 };

 let { close }: Props = $props();

 let text = $state('');
 let textareaEl: HTMLTextAreaElement | null = $state(null);
 const isFilled = $derived(text.length > 0);

 function accountsConfigImport() {
  if (text) {
   let data = JSON.parse(text);
   accounts_config.set(data);
   close();
  } else {
   console.error('No data to import');
  }
 }

 $effect(() => {
  textareaEl?.focus();
 });
</script>

<style>
 .account-import {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  @media (max-width: 768px) {
   width: 100%;
  }

  .scrollable {
   overflow: auto;
   border-radius: 10px;
   width: 100%;
  }

  :global(.button) {
   position: sticky;
   top: 0;
   left: 0;
   z-index: 1;
  }

  textarea {
   padding: 5px;
   letter-spacing: 1px;
   position: absolute;
   opacity: 0;
   color: white;
   background-color: black;
   z-index: 0;
   inset: 0;

   &.isFilled {
    pointer-events: none;
   }
  }
 }
</style>

<div class="account-import">
 <div class="scrollable">
  <Code bind:code={text} />
  <textarea class:isFilled bind:value={text} bind:this={textareaEl}></textarea>
 </div>
 <Button img="img/import.svg" text="Import" onClick={accountsConfigImport} />
</div>
