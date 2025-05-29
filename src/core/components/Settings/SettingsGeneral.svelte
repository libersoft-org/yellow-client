<script lang="ts">
 import Switch from '../Switch/Switch.svelte';
 import Table from '@/core/components/ResponsiveTable/Table.svelte';
 import THead from '@/core/components/ResponsiveTable/THead.svelte';
 import THeadTr from '@/core/components/ResponsiveTable/THeadTr.svelte';
 import THeadTh from '@/core/components/ResponsiveTable/THeadTh.svelte';
 import TBody from '@/core/components/ResponsiveTable/TBody.svelte';
 import TBodyTr from '@/core/components/ResponsiveTable/TBodyTr.svelte';
 import TBodyTd from '@/core/components/ResponsiveTable/TBodyTd.svelte';

 import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/settings.ts';

 const settings = [
  { label: 'Run on system startup', store: runOnSystemStartup },
  { label: 'Show tray icon', store: showTrayIcon },
  { label: 'Close to minimize', store: closeToMinimize },
 ];
</script>

<Table>
 <THead>
  <THeadTr>
   {#each settings as setting}
    <THeadTh>{setting.label}</THeadTh>
   {/each}
  </THeadTr>
 </THead>
 <TBody>
  <TBodyTr>
   {#each settings as setting}
    <TBodyTd title={setting.label}>
     <Switch bind:checked={setting.store} />
    </TBodyTd>
   {/each}
  </TBodyTr>
 </TBody>
</Table>
