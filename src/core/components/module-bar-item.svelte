<script>
 import Icon from './icon.svelte';

 export let decl;
 export let clickSetModule;
 export let online;
</script>

<div style="background-color: {$online === false ? 'red' : ''};">
 <Icon img="img/modules/{decl.id}.svg" alt={decl.name} size="30" onClick={() => clickSetModule(decl.id)} />
</div>
