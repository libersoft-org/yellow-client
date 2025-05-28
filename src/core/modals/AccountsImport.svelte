<script lang="ts">
 import Tabs from '../components/Tabs/Tabs.svelte';
 import TabsItem from '../components/Tabs/TabsItem.svelte';
 import AccountsImportJson from './AccountsImportJson.svelte';
 import AccountsImportQR from './AccountsImportQR.svelte';

 type Props = {
  close: () => void;
 };

 let { close }: Props = $props();

 let activeTab = $state('json');
</script>

<style>
 .account-import {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  @media (max-width: 768px) {
   width: 100%;
  }

  .scrollable {
   overflow: auto;
   border-radius: 10px;
   width: 100%;
  }

  :global(.button) {
   position: sticky;
   top: 0;
   left: 0;
   z-index: 1;
  }

  textarea {
   padding: 5px;
   letter-spacing: 1px;
   position: absolute;
   opacity: 0;
   color: white;
   background-color: black;
   z-index: 0;
   inset: 0;

   &.isFilled {
    pointer-events: none;
   }
  }
 }
</style>

<Tabs>
 <TabsItem img="img/import.svg" label="JSON" active={activeTab === 'json'} onClick={() => (activeTab = 'json')} />
 <TabsItem img="img/photo.svg" label="QR Code" active={activeTab === 'qr'} onClick={() => (activeTab = 'qr')} />
</Tabs>

{#if activeTab === 'json'}
 <AccountsImportJson {close} />
{:else if activeTab === 'qr'}
 <AccountsImportQR {close} />
{/if}
