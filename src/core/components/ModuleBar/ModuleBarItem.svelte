<script>
 import BaseButton from '../Button/BaseButton.svelte';
 import Indicator from './ModuleBarIndicator.svelte';
 import Icon from '../Icon/Icon.svelte';
 export let decl;
 export let clickSetModule;
 export let online;
 export let selected;
</script>

<style>
 .item {
  position: relative;
  border-radius: 10px;
  transition: background-color 0.25s linear;
 }

 .item:hover {
  background-color: #303030;
  zoom: 1.2;
 }

 .item.selected {
  background-color: #404040;
 }

 @keyframes blink {
  0% {
   opacity: 0;
  }
  50% {
   opacity: 1;
  }
  100% {
   opacity: 0;
  }
 }
</style>

<BaseButton data-testid={'ModuleBarItem-' + decl.id} onClick={() => clickSetModule(decl.id)}>
 <div class="item {selected && 'selected'}">
  <Indicator img="img/indicator-cross.svg" alt="X" enabled={$online === false ? true : false} />
  <Icon img="img/modules/{decl.id}.svg" alt={decl.name} colorVariable="--icon-yellow" size="30" />
 </div>
</BaseButton>
