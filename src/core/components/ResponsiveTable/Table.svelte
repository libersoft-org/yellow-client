<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  expand?: boolean;
  children: Snippet;
 };

 const { expand = $bindable(false), children }: Props = $props();
</script>

<style>
 .responsvive-table {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  max-width: 100vw;
  background-color: #ffdd1150;

  @media only screen and (min-width: 64em) {
   border: 1px solid #222 !important;
   border-radius: 8px;
   box-shadow:
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 2px -1px;
  }
 }

 table {
  border: 0;
  padding-bottom: 0;
  display: block;
  width: 100%;
  border-collapse: collapse;
  overflow: clip;
  font-size: 14px;

  @media only screen and (min-width: 64em) {
   width: 100%;
  }
 }
</style>

<div class="responsvive-table">
 <table class:expand>
  {@render children()}
 </table>
</div>
