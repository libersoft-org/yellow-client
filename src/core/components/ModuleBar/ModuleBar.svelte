<script>
 import { debug, active_account, module_decls, selected_module_id } from '../../core.js';
 import { getColorFromCSSToFilter } from '../../utils/colors.js';
 import { get } from 'svelte/store';
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
 import ModuleBarItem from './ModuleBarItem.svelte';
 import resize from '@/core/actions/resizeObserver.ts';
 import { order } from '@/core/utils/utils.ts';

 let itemsHeight = '50px';
 let itemsEl;

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

 $: {
  if (expanded && itemsEl) {
   itemsHeight = `${itemsEl.scrollHeight}px`;
   setTimeout(() => {
    if (expanded) itemsHeight = 'auto';
   }, 250);
  } else if (!expanded && itemsEl) {
   const currHeight = itemsEl.scrollHeight;
   itemsHeight = `${currHeight}px`;
   requestAnimationFrame(() => {
    itemsHeight = '50px';
   });
  }
 }

 function onResize(entry) {
  const { target, contentRect } = entry;
  const { width, height } = contentRect;
  const children = target.children;
  const childrenTotalWidth = Array.from(children).reduce((total, child) => {
   return total + child.getBoundingClientRect().width;
  }, 0);
  expandEnabled = childrenTotalWidth > width;
 }
</script>

<style>
 .module-bar {
  display: flex;
  border-bottom: 1px solid #555;
  background-color: #222;
  display: flex;
  align-items: center;
  height: fit-content;
 }

 .items {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  row-gap: 10px;
  flex-wrap: wrap;
  padding: 10px;
  margin: 0;
  overflow: hidden;
  will-change: height;
 }

 .items.expanded {
  overflow: visible;
  height: initial;
 }

 .dropdown {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  cursor: default;

  :global(.icon) {
   transform: rotate(0deg);
   transition: transform 0.3s ease;

   :global(.module-bar &) {
    position: relative;
    top: 14px;

    &:is(.expanded &) {
     transform: rotate(-180deg);
    }
   }
  }

  &:not(.expand-enabled &) {
   display: none;
  }
 }

 .module-bar:not(.expand-enabled) .dropdown {
  opacity: 0.3;
  cursor: default;
  pointer-events: none;
 }
</style>

<div class="module-bar" class:expand-enabled={expandEnabled}>
 <div use:resize={onResize} bind:this={itemsEl} class="items {expanded ? 'expanded' : ''}" style="height: {itemsHeight}; transition: height 0.25s cubic-bezier(0.4,0,0.2,1);">
  {#each module_decls_ordered as decl (decl.id)}
   <div>
    <ModuleBarItem online={$active_account?.module_data[decl.id]?.online} selected={$selected_module_id === decl.id} {decl} {clickSetModule} />
   </div>
  {/each}
 </div>
 <BaseButton disabled={!expandEnabled}>
  <div class="dropdown {expanded ? 'expanded' : ''}">
   <Icon img={'img/up.svg'} alt={expanded ? '▲' : '▼'} colorVariable="--icon-white" size="20px" padding="10" onClick={clickExpand} />
  </div>
 </BaseButton>
</div>
