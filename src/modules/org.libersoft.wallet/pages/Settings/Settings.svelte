<script>
 import Section from '../components/settings-section.svelte';
 import SectionGeneral from './settings-general.svelte';
 import SectionNetworks from './settings-networks.svelte';
 import SectionWallets from './settings-wallets.svelte';
 let section = 'general';

 function setSection(name) {
  console.log('SET SECTION:', name);
  section = name;
 }
</script>

<style>
 .settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .sections {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  background-color: #ffa;
  border: 1px solid rgb(155, 155, 93);
 }
</style>

<div class="settings">
 <div class="sections">
  <Section label="General" active={section === 'general'} onClick={() => setSection('general')} />
  <Section label="Networks" active={section === 'networks'} onClick={() => setSection('networks')} />
  <Section label="Wallets" active={section === 'wallets'} onClick={() => setSection('wallets')} />
 </div>
 {#if section}
  {#if section === 'general'}
   <SectionGeneral />
  {:else if section === 'networks'}
   <SectionNetworks />
  {:else if section === 'wallets'}
   <SectionWallets />
  {/if}
 {/if}
</div>
