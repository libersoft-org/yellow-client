<script>
 import Icon from './icon.svelte';

 export let decl;
 export let clickSetModule;
 export let online;
 export let selected;
</script>

<style>
 .item {
  border-radius: 10px;
  transition: background-color 0.5s;
 }

 .item.selected {
  background-color: #383838;
 }

 .item.offline {
  background-color: #f00;
 }
</style>

<div class="item {$online === false ? 'offline' : selected && 'selected'}">
 <Icon img="img/modules/{decl.id}.svg" alt={decl.name} size="30" onClick={() => clickSetModule(decl.id)} />
</div>
