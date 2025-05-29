<script lang="ts">
  import Switch from '../Switch/Switch.svelte';
  import Table from '@/core/components/Table/Table.svelte';
  import Thead from '@/core/components/Table/TableThead.svelte';
  import TheadTr from '@/core/components/Table/TableTheadTr.svelte';
  import TheadTh from '@/core/components/Table/TableTheadTh.svelte';
  import Tbody from '@/core/components/Table/TableTbody.svelte';
  import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
  import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';

  import { runOnSystemStartup, showTrayIcon, closeToMinimize } from '@/core/settings.ts';

  const settings = [
    { label: 'Run on system startup', store: runOnSystemStartup },
    { label: 'Show tray icon', store: showTrayIcon },
    { label: 'Close to minimize', store: closeToMinimize },
  ];
</script>

<Table>
  <Thead>
    <TheadTr>
      {#each settings as setting}
        <TheadTh>{setting.label}</TheadTh>
      {/each}
    </TheadTr>
  </Thead>
  <Tbody>
    <TbodyTr>
      <TbodyTd title="Run on system startup">
        <Switch ariaLabel="Run on system startup" bind:checked={$runOnSystemStartup} />
      </TbodyTd>
      <TbodyTd title="Show tray icon">
        <Switch ariaLabel="Show tray icon" bind:checked={$showTrayIcon} />
      </TbodyTd>
      <TbodyTd title="Close to minimize">
        <Switch ariaLabel="Close to minimize" bind:checked={$closeToMinimize} />
      </TbodyTd>
    </TbodyTr>
  </Tbody>
</Table>
