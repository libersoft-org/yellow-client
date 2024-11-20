<script>
 import ContextMenuItem from './context-menu-item.svelte';
 export let x = 0;
 export let y = 0;
 export let items = [];
 let menuStyle = '';

 $: menuStyle = `
  position: absolute;
  top: ${y}px;
  left: ${x}px;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ccc;
  min-width: 150px;
 `;
</script>

<div style={menuStyle}>
 {#each items as item}
  <ContextMenuItem icon={item.icon} label={item.label} action={item.action} />
 {/each}
</div>
