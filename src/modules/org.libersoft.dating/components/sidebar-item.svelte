<script>
 import BaseButton from '../../../core/components/base-button.svelte';
 export let img = null;
 export let label = '';
 export let onClick;
</script>

<style>
 .item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 30px;
  padding: 10px;
  background-color: #fffcf0;
  border-bottom: 1px solid #dd9;
 }

 .item .image {
  width: 20px;
  height: 20px;
 }
</style>

<BaseButton {onClick}>
 <div class="item">
  {#if img}
   <div class="image"><img src="modules/org.libersoft.dating/img/{img}" alt={label} /></div>
  {/if}
  <div>{label}</div>
 </div>
</BaseButton>
