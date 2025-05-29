<script>
  import { module } from '../../module.js';
  import { get } from 'svelte/store';
  import { addNetwork, removeNetwork, networks, default_networks } from '../../wallet.ts';
  import Icon from '@/core/components/Icon/Icon.svelte';
  import Modal from '@/core/components/Modal/Modal.svelte';
  import ButtonBar from '@/core/components/Button/ButtonBar.svelte';
  import Button from '@/core/components/Button/Button.svelte';
  import ModalEditNetwork from '../../modals/edit-network.svelte';
  import ModalTokenList from '../../modals/token-list.svelte';
  import Table from '@/core/components/Table/Table.svelte';
  import Tbody from '@/core/components/Table/TableTbody.svelte';
  import TbodyTr from '@/core/components/Table/TableTbodyTr.svelte';
  import TbodyTd from '@/core/components/Table/TableTbodyTd.svelte';
  import TableActionItems from '@/core/components/Table/TableActionItems.svelte';

  let showModalEditNetwork = false;
  let showModalTokenList = false;
  let modalItemID = null;
  let modalItem = null;

  function editNetwork(net) {
    console.log('editNetwork', net);
    modalItem = net;
    showModalEditNetwork = true;
  }

  function tokenList(net) {
    console.log('tokenList', net);
    modalItemID = net.guid;
    showModalTokenList = true;
  }

  function doExport() {
    console.log('EXPORT NETWORKS');
    let data = get(networks);
    let json = JSON.stringify(data, null, 2);
    console.log('EXPORTED NETWORKS:', json);
    window.prompt('Copy the exported networks:', json);
  }

  function doImport() {
    console.log('IMPORT NETWORKS');
    let json = window.prompt('Paste the exported networks here:');
    if (json) {
      try {
        let data = JSON.parse(json);
        console.log('IMPORTED NETWORKS:', data);
        networks.set(data);
      } catch (e) {
        console.error('IMPORT NETWORKS ERROR:', e);
      }
    }
  }
</script>

<div class="networks">
  <ButtonBar>
    <Button img="img/export.svg" text="Export" onClick={() => doExport()} />
    <Button img="img/import.svg" text="Import" onClick={() => doImport()} />
  </ButtonBar>

  {#if $networks.length !== 0}
    <div class="bold">My networks:</div>
  {/if}

  <Table breakpoint="500px">
    <Tbody>
      {#each $networks as n, index (n.guid)}
        <TbodyTr>
          <TbodyTd>
            <div>
              {#if n.currency?.iconURL}
                <Icon img={n.currency.iconURL} alt="" />
              {/if}
              <div class="name">{n.name}</div>
            </div>
          </TbodyTd>
          <TbodyTd>
            <TableActionItems>
              <Icon
                img="modules/{module.identifier}/img/coin.svg"
                alt="Token list"
                size="20px"
                padding="5px"
                onClick={() => tokenList(n)}
              />
              <Icon
                img="img/edit.svg"
                colorVariable="--icon-blue"
                alt="Edit network"
                size="20px"
                padding="5px"
                onClick={() => editNetwork(n)}
              />
              <Icon
                img="img/del.svg"
                colorVariable="--icon-red"
                alt="Delete network"
                size="20px"
                padding="5px"
                onClick={() => removeNetwork(n)}
              />
            </TableActionItems>
          </TbodyTd>
        </TbodyTr>
      {/each}
    </Tbody>
  </Table>

  <div class="bold">Default networks:</div>
  <Table breakpoint="500px">
    <Tbody>
      {#each $default_networks as n, index}
        <TbodyTr>
          <TbodyTd>
            <div>
              {#if n.currency?.iconURL}
                <Icon img={n.currency.iconURL} />
              {/if}
              <div class="name">{n.name}</div>
            </div>
          </TbodyTd>
          <TbodyTd>
            <TableActionItems>
              <Icon
                img="img/add.svg"
                alt="Add to my networks"
                colorVariable="--icon-black"
                size="20px"
                padding="5px"
                onClick={() => addNetwork(n)}
              />
            </TableActionItems>
          </TbodyTd>
        </TbodyTr>
      {/each}
    </Tbody>
  </Table>
</div>
<Modal title="Edit network" body={ModalEditNetwork} params={{ item: modalItem }} bind:show={showModalEditNetwork} />
<Modal title="Token list" body={ModalTokenList} params={{ item: modalItemID }} bind:show={showModalTokenList} />

<style>
  .networks {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
