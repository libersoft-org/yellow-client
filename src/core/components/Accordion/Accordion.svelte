<script lang="ts">
 import { tick, type Snippet } from 'svelte';
 import BaseButton from '../Button/BaseButton.svelte';
 import Icon from '../Icon/Icon.svelte';

 type Props = {
  items: Array<{ name: string; id: string }>;
  activeIndex?: number | null;
  snippet: Snippet<[any]> | null;
 };

 let { items, activeIndex = null, snippet }: Props = $props();

 async function handleClick(index: number) {
  const isClosing = activeIndex === index;
  const prevIndex = activeIndex;

  if (prevIndex !== null) {
   const prevEl = document.querySelector(`.content[data-index="${prevIndex}"]`) as HTMLElement;
   if (prevEl) {
    prevEl.style.height = `${prevEl.scrollHeight}px`;
    prevEl.offsetHeight;
    prevEl.style.height = '0px';
   }
  }

  if (isClosing) {
   activeIndex = null;
   return;
  }

  activeIndex = index;
  await tick();

  const el = document.querySelector(`.content[data-index="${index}"]`) as HTMLElement;
  if (el) {
   el.style.height = '0px';
   el.offsetHeight;
   el.style.height = `${el.scrollHeight}px`;

   setTimeout(() => {
    if (activeIndex === index) {
     el.style.height = 'auto';
    }
   }, 300);
  }
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

  :global(.header img) {
   transform: rotate(0deg);
   transition: transform 0.3s ease;
  }

  &:last-child {
   border-bottom: none;
  }
 }

 .accordion .item .header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fd1;
  cursor: pointer;
  filter: brightness(1);
  transition: filter 0.3s ease;
 }

 .accordion .item .header {
  .title {
   flex-grow: 1;
   font-weight: bold;
  }
 }

 .accordion .item .content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
 }

 .accordion .item.is-expanded .header {
  filter: brightness(1.05);
 }

 .accordion .item {
  display: grid;

  &.is-expanded {
   :global(.header img) {
    transform: rotate(180deg);
   }
  }
 }
</style>

<div class="accordion">
 {#each items as item, index}
  <div class="item {activeIndex === index ? 'is-expanded' : ''}">
   <BaseButton onClick={() => handleClick(index)}>
    <div class="header">
     <div class="title">{item.name}</div>
     <Icon img="img/down.svg" alt="Chevron Down" colorVariable="--icon-black" size="12px" />
    </div>
   </BaseButton>

   <div class="content {activeIndex === index ? 'is-expanded' : ''}" data-index={index}>
    {@render snippet?.(item)}
   </div>
  </div>
 {/each}
</div>
