<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  title: string;
 };

 const { children, title }: Props = $props();
</script>

<style>
 th {
  :global(.table-wide &) {
   display: table-cell;
   white-space: nowrap;
   border-style: none;
   min-width: 50px;
   vertical-align: middle;
   padding: 8px;
   border: 0;
   text-align: left;
   white-space: normal;
   font-weight: normal;
  }
 }

 th[data-title]:before {
  content: attr(data-title) ':\00A0';
  font-weight: bold;

  :global(.table-wide &) {
   content: '';
   font-weight: bold;
  }
 }

 th:not([data-title]) {
  font-weight: bold;
 }

 th {
  display: block;
  padding: 10px;
  text-align: left;

  :global(.table-wide &) {
   display: table-cell;
   width: 100%;
  }

  &:before {
   display: inline-block;
   width: 90px;

   :global(.table-wide &) {
    display: table;
    width: 100%;
   }
  }
 }

 th {
  display: block;
  padding: 10px;
  text-align: left;

  :global(.table-wide &) {
   display: table-cell;
   width: 100%;
  }

  &:before {
   display: inline-block;
   width: 90px;

   :global(.table-wide &) {
    display: table;
    width: 100%;
   }
  }
 }
</style>

<th data-title={title} scope="row">
 {@render children()}
</th>
