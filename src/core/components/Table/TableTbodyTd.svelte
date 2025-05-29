<script lang="ts">
 import type { Snippet } from 'svelte';

 type Props = {
  children: Snippet;
  title: string;
 };

 let { children, title }: Props = $props();
</script>

<style>
 td {
  border: 0;
  text-align: left;
  white-space: normal;
  display: block;

  :global(& > div) {
   display: flex;
   align-items: center;
  }

  :global(.table-wide &) {
   display: table-cell;
   white-space: nowrap;
   border-style: none;
   text-align: left !important;
   min-width: 50px;
   vertical-align: middle;
   padding: 10px !important;
  }
 }

 td {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  padding: 10px;
  text-align: left;

  :global(.table-wide &) {
   display: table-cell;
   width: 100%;
  }

  &:before {
   display: inline-block;
   width: 15vw;
   max-width: 300px;
  }

  :global(.table-wide &) {
   &:before {
    display: table;
    width: 100%;
   }
  }
 }

 td[data-title] {
  &:before {
   content: attr(data-title) ':\00A0';
   font-weight: bold;
  }

  :global(.table-wide &) {
   &:before {
    content: '';
    font-weight: bold;
   }
  }
 }

 td:empty {
  display: none;

  :global(.table-wide &) {
   display: table-cell;
  }
 }
</style>

<td data-title={title}>
 {@render children()}
</td>
