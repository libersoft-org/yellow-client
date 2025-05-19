<script lang="ts">
 import { type Snippet } from 'svelte';
 import BaseButton from '../Button/BaseButton.svelte';
 import Icon from '../Icon/Icon.svelte';

 type Props = {
  items: Array<{ name: string; id: string }>;
  activeIndex?: number | null;
  children: Snippet;
  snippet: Snippet | null;
 };

 let { children, items, activeIndex, snippet = null }: Props = $props();

 function handleClick(index: number) {
  activeIndex = activeIndex === index ? null : index;
 }
</script>

<style>
 .accordion {
  border: 1px solid var(--accordion-border-color, #b90);
  border-radius: 8px;
  overflow: hidden;

  &:empty {
   display: none;
  }
 }

 .accordion .item {
  border-bottom: 1px solid var(--accordion-border-color, #b90);

  &:last-child {
   margin-bottom: -1px;
  }
 }

 .accordion .item .header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fd1;
 }

 .accordion .item .header .title {
  flex-grow: 1;
  font-weight: bold;
 }

 .accordion .item .content {
  height: 0;
  overflow: hidden;
  transition: height 0.4s ease;
 }

 .accordion .item .content.active {
  height: auto;
  display: block;
 }

 :global(.header .icon) {
  transition: transform 0.3s ease;
 }

 :global(.item:has(.content.active) .header .icon) {
  transform: rotate(180deg);
 }
</style>

<div class="accordion">
 {#each items as item, index}
  <div class="item">
   <BaseButton onClick={() => handleClick(index)}>
    <div class="header">
     <div class="title">{item.name}</div>
     <Icon img="img/down.svg" alt="Chevron Down" colorVariable="--icon-black" size="12px" />
    </div>
   </BaseButton>
   <div class="content {activeIndex === index ? 'active' : ''}">
    {#if snippet !== null}
     {#if index === activeIndex}
      {@render snippet(item)}
     {/if}
    {:else}
     {@render children?.()}
    {/if}
   </div>
  </div>
 {/each}
</div>
