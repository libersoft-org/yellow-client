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

  @media only screen and (min-width: 64em) {
   display: table-cell;
   white-space: nowrap;
   border-style: none;
   text-align: center !important;
   min-width: 50px;
   vertical-align: middle;
   padding: 10px !important;
  }
 }

 td {
  display: block;
  padding: 10px;
  text-align: left;
  vertical-align: middle;

  @media only screen and (min-width: 64em) {
   display: table-cell;
   width: 100%;
  }

  &:before {
   display: inline-block;
   width: 90px;

   @media only screen and (min-width: 64em) {
    display: table;
    width: 100%;
   }
  }
 }

 td[data-title]:before {
  content: attr(data-title) ':\00A0';
  font-weight: bold;

  @media only screen and (min-width: 64em) {
   content: '';
   font-weight: bold;
  }
 }

 td:empty {
  display: none;

  @media only screen and (min-width: 64em) {
   display: table-cell;
  }
 }
</style>

<td data-title={title}>
 {@render children()}
</td>
