<script>
 import Tabs from '../../../core/components/tabs.svelte';
 import Item from '../../../core/components/tabs-item.svelte';
 import TabEmojiSet from './emojiset.svelte';
 import TabSettings from './emojis-settings.svelte';
 import { identifier } from '../messages.js';
 let activeTab = $state('emojiset');
 const tabs = {
  emojiset: TabEmojiSet,
  settings: TabSettings,
 };

 function setTab(e, name) {
  activeTab = name;
 }
</script>

<style>
 .topbar {
  padding: 10px;
 }
</style>

<div class="topbar">
 <Tabs>
  <Item active={activeTab === 'emojiset'} img="modules/{identifier}/img/emoji-white.svg" onClick={e => setTab(e, 'emojiset')} />
  <Item active={activeTab === 'settings'} img="img/settings.svg" onClick={e => setTab(e, 'settings')} />
 </Tabs>
</div>
{#await tabs[activeTab] then Component}
 <!-- Svelte 5 -->
 <Component />
{/await}
