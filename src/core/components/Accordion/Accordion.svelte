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

  // Collapse previous
  if (prevIndex !== null) {
   const prevEl = document.querySelector(`.content[data-index="${prevIndex}"]`) as HTMLElement;
   if (prevEl) {
    prevEl.style.height = `${prevEl.scrollHeight}px`;
    prevEl.offsetHeight; // force reflow
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
   el.offsetHeight; // force reflow again
   el.style.height = `${el.scrollHeight}px`;

   // After animation, reset height to auto for flexibility
   setTimeout(() => {
    if (activeIndex === index) {
     el.style.height = 'auto';
    }
   }, 300); // must match CSS transition duration
  }
 }
</script>

<style>
 .accordion {
  border: 1px solid var(--accordion-border-color, #b90);
  border-radius: 8px;
  overflow: hidden;
 }

 .accordion .item {
  border-bottom: 1px solid var(--accordion-border-color, #b90);

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
 }

 .accordion .item .header .title {
  flex-grow: 1;
  font-weight: bold;
 }

 .accordion .item .content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
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

   <!-- Always render DOM content -->
   <div class="content" data-index={index}>
    {@render snippet?.(item)}
   </div>
  </div>
 {/each}
</div>
