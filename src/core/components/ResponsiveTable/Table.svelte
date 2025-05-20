<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  expand?: boolean;
  children: Snippet;
  [key: string]: unknown;
 };

 const { expand = $bindable(false), children, ...restProps }: Props = $props();
</script>

<style>
 .responsvive-table {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  max-width: 100vw;
  background-color: #ffdd1150;
 }

 table {
  border: 0;
  padding-bottom: 0;
  display: block;
  width: 100%;
  border-collapse: collapse;
  overflow: clip;
  font-size: 14px;
 }
</style>

<div class="responsvive-table" {...restProps}>
 <table class:expand>
  {@render children()}
 </table>
</div>
