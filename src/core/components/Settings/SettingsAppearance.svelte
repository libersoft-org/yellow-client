<script lang="ts">
 import Select from '@/core/components/Select/Select.svelte';
 import Option from '@/core/components/Select/SelectOption.svelte';
 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';
 import { TAURI } from '@/core/tauri.ts';
 import { zoom } from '@/core/settings.ts';
 import { setZoom } from '@/core/zoom.ts';
 import { derived, get, writable } from 'svelte/store';

 import {selected_theme_index, current_theme, themes_stored}  from '../../appearance_store.js';

</script>

<style>
 .zoom {
  display: flex;

  input {
   margin-top: 6px;
  }
 }
</style>

<Table>
 <THead>
  <THeadTr>
   {#if TAURI}
    <THeadTh>Zoom:</THeadTh>
   {/if}
   <THeadTh>Theme:</THeadTh>
  </THeadTr>
 </THead>
 <TBody>
  <TBodyTr>
   {#if TAURI}
    <TBodyTd title="Zoom">
     <span>{Math.round(($zoom || 0) * 100)}%</span>
     <div class="zoom">
      <input type="range" min="0.3" max="3" step="0.1" bind:value={$zoom} onchange={setZoom} />
     </div>
    </TBodyTd>
   {/if}
   <TBodyTd title="Theme">

    <Select type=number bind:value={$selected_theme_index}>

        {#each $themes_stored as theme, index}

            <Option text="{theme.name}" value="{index}" />

        {/each}

    </Select>
   </TBodyTd>
  </TBodyTr>
 </TBody>
</Table>
