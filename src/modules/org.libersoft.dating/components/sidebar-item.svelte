<script>
 import BaseButton from '@/core/components/Button/BaseButton.svelte';
 import Icon from '@/core/components/Icon/Icon.svelte';
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
</style>

<BaseButton {onClick}>
 <div class="item">
  {#if img}
   <Icon img="modules/org.libersoft.dating/img/{img}" alt={label} colorVariable="--icon-black" size="20" padding="0" />
  {/if}
  <div>{label}</div>
 </div>
</BaseButton>
