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

  /* @media only screen and (min-width: 64em) {
			border: 1px solid #222 !important;
			border-radius: 8px;
		} */
 }

 table {
  border: 0;
  padding-bottom: 0;
  display: block;
  width: 100%;
  border-collapse: collapse;
  overflow: clip;
  font-size: 14px;

  /* @media only screen and (min-width: 64em) {
   width: 100%;
  } */
 }
</style>

<div class="responsvive-table" {...restProps}>
 <table class:expand>
  {@render children()}
 </table>
</div>
