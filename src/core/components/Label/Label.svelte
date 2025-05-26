<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  text?: string;
  row?: boolean;
  id?: string;
 };

 let { children, text = $bindable(''), row = $bindable(false), id = '' }: Props = $props();
</script>

<style>
 label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  -webkit-tap-highlight-color: transparent;
 }

 label.row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
 }

 .text {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
  cursor: pointer;
 }
</style>

<label class:row>
 {#if text}
  <div class="text">{text}:</div>
 {/if}
 {@render children()}
</label>
