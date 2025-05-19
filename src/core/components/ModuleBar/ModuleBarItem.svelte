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
  z-index: 1;
  border-radius: 10px;
  transform: scale(1);
  transition:
   transform 0.3s ease,
   background-color 0.25s linear;
  opacity: 0;
  animation: blink 1.5s forwards;
  animation-delay: 0.5s;

  &:not(.selected) {
   &:hover {
    background-color: #303030;
    transform: scale(1.1);
   }
  }
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
   opacity: 1;
  }
 }
</style>

<BaseButton data-testid={'ModuleBarItem-' + decl.id} onClick={() => clickSetModule(decl.id)}>
 <div class="item {selected && 'selected'}">
  <Indicator img="img/indicator-cross.svg" alt="X" enabled={$online === false ? true : false} />
  <Icon img="img/modules/{decl.id}.svg" alt={decl.name} colorVariable="--icon-yellow" size="24px" />
 </div>
</BaseButton>
