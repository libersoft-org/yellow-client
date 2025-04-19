<script>
 import { debug, active_account, module_decls, selected_module_id } from '../../core.js';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';
 import { get } from 'svelte/store';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import ModuleBarItem from './ModuleBarItem.svelte';
 import SettingsNotifications from '../Settings/SettingsNotifications.svelte';
 import resize from '@/core/actions/resizeObserver.ts';
 import { order } from '@/core/utils/utils.ts';

 export let onSelectModule;
 export let onCloseModule;
 let module_data;
 let lastModuleSelected = false;
 let expanded = false;
 let module_decls_ordered = [];
 let expandEnabled = false;

 $: module_decls_ordered = order($module_decls);
 $: module_data = $active_account?.module_data || {};
 //$: console.log('module-bar module_data:', module_data);
 $: module_data_ordered = order(module_data);
 //$: console.log('module-bar module_data_ordered:', module_data_ordered);
 $: selectLastModule(module_data);

 function selectLastModule(module_data) {
  //console.log('selectLastModule: lastModuleSelected: ', module_data);
  if (!lastModuleSelected && module_data_ordered && module_data_ordered.length > 0) {
   //console.log('selectLastModule: lastModuleSelected: ', lastModuleSelected);
   lastModuleSelected = true;
   let acc = get(active_account);
   //console.log('selectLastModule: acc: ', acc);
   let id = acc.settings?.last_module_id;
   //console.log('selectLastModule: ', module_data);
   //console.log('selectLastModule: id: ', id);
   if (module_data[id]) onSelectModule(id);
  }
 }

 function clickSetModule(id) {
  console.log('clickSetModule: ' + id);
  if ($selected_module_id === id) onCloseModule();
  else onSelectModule(id);
 }

 function clickExpand() {
  expanded = !expanded;
 }

 function onResize(entry) {
  const { target, contentRect } = entry;
  console.log('onResize: ', entry);
  const { width, height } = contentRect;
  const children = target.children;
  const childrenTotalWidth = Array.from(children).reduce((total, child) => {
   return total + child.getBoundingClientRect().width;
  }, 0);
  console.log('childrenTotalWidth', width, childrenTotalWidth);
  expandEnabled = childrenTotalWidth > width;
 }
</script>

<style>
 .module-bar {
  display: flex;
  border-bottom: 1px solid #555;
  background-color: #222;
 }

 .items {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-grow: 1;
  padding: 5px;
  overflow: hidden;
  flex-wrap: wrap;
  height: 50px;
 }

 .items.expanded {
  overflow: visible;
  height: initial;
 }

 .dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
 }

 .module-bar:not(.expand-enabled) .dropdown {
  opacity: 0.3;
  cursor: default;
  pointer-events: none;
 }
</style>

<div class="module-bar" class:expand-enabled={expandEnabled}>
 <div use:resize={onResize} class="items {expanded ? 'expanded' : ''}">
  {#each module_decls_ordered as decl (decl.id)}
   <ModuleBarItem online={$active_account?.module_data[decl.id]?.online} selected={$selected_module_id === decl.id} {decl} {clickSetModule} />
  {/each}
 </div>
 <BaseButton disabled={!expandEnabled} onClick={clickExpand}>
  <div class="dropdown">
   <Icon img={expanded ? 'img/up.svg' : 'img/down.svg'} alt={expanded ? '▲' : '▼'} colorVariable="--icon-white" size="20" padding="10" />
  </div>
 </BaseButton>
</div>

{#if $debug}<SettingsNotifications />{/if}
