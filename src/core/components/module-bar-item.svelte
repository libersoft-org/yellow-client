<script>
 import Icon from './icon.svelte';
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
 }

 .item.selected {
  background-color: #404040;
 }

 .item .indicator {
  display: none;
  position: absolute;
  top: 0px;
  right: 0px;
  width: 16px;
  height: 16px;
  padding: 5px;
  border-radius: 50%;
  background-color: #222;
  animation: blink 1s infinite;
 }

 .item .indicator.enabled {
  display: block;
 }

 .item.selected .indicator {
  background-color: #383838;
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

<div class="item {selected && 'selected'}">
 <img class="indicator {$online === false && 'enabled'}" src="img/cross-red.svg" alt="X" onClick={() => clickSetModule(decl.id)} />
 <Icon img="img/modules/{decl.id}.svg" alt={decl.name} size="30" onClick={() => clickSetModule(decl.id)} />
</div>
