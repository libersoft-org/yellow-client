<script>
 import { onMount, setContext, getContext, afterUpdate, createEventDispatcher, tick } from 'svelte';
 import { writable } from 'svelte/store';
 export let target = null;
 export let open = false;
 export let x = 0;
 export let y = 0;
 export let ref = null;
 const dispatch = createEventDispatcher();
 const position = writable([x, y]);
 const currentIndex = writable(-1);
 const hasPopup = writable(false);
 const menuOffsetX = writable(0);
 const ctx = getContext('ContextMenu');
 let options = [];
 let direction = 1;
 let prevX = 0;
 let prevY = 0;
 let focusIndex = -1;
 let openDetail = null;

 function close() {
  open = false;
  x = 0;
  y = 0;
  prevX = 0;
  prevY = 0;
  focusIndex = -1;
 }

 function openMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const { height, width } = ref.getBoundingClientRect();

  if (open || x === 0) {
   if (window.innerWidth - width < e.x) {
    x = e.x - width;
   } else {
    x = e.x;
   }
  }

  if (open || y === 0) {
   menuOffsetX.set(e.x);

   if (window.innerHeight - height < e.y) {
    y = e.y - height;
   } else {
    y = e.y;
   }
  }
  position.set([x, y]);
  open = true;
  openDetail = e.target;
 }

 $: if (target != null) {
  if (Array.isArray(target)) {
   target.forEach(node => {
    node?.addEventListener('contextmenu', openMenu);
    node?.addEventListener('mousedown', openMenu);
   });
  } else {
   target.addEventListener('contextmenu', openMenu);
   target.addEventListener('mousedown', openMenu);
  }
 }

 onMount(() => {
  return () => {
   if (target != null) {
    if (Array.isArray(target)) {
     target.forEach(node => {
      node?.removeEventListener('contextmenu', openMenu);
      node?.removeEventListener('mousedown', openMenu);
     });
    } else {
     target.removeEventListener('contextmenu', openMenu);
     target.removeEventListener('mousedown', openMenu);
    }
   }
  };
 });

 setContext('ContextMenu', {
  menuOffsetX,
  currentIndex,
  position,
  close,
  setPopup: popup => {
   hasPopup.set(popup);
  },
 });

 afterUpdate(() => {
  if (open) {
   options = [...ref.querySelectorAll("li[data-nested='false']")];

   if (level === 1) {
    if (prevX !== x || prevY !== y) ref.focus();
    prevX = x;
    prevY = y;
   }

   dispatch('open', openDetail);
  } else {
   dispatch('close');
  }

  if (!$hasPopup && options[focusIndex]) options[focusIndex].focus();
 });

 $: level = !ctx ? 1 : 2;
 $: currentIndex.set(focusIndex);
</script>

<style>
 .context-menu {
  visibility: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  position: fixed;
  z-index: 9000;
  /*min-width: 100px;*/
  max-width: calc(100% - 20px);
  border-radius: 10px;
  border: 1px solid #ccc;
  background-color: #fff;
  overflow: auto;
 }

 .context-menu-open {
  visibility: visible;
 }
</style>

<svelte:window
 on:contextmenu={e => {
  if (target != null) return;
  if (level > 1) return;
  if (!ref) return;
  openMenu(e);
 }}
 on:mousedown={e => {
  console.log('context-menu svelte:window click:', e);
  if (!open) return;
  console.log('context-menu svelte:window click close:', e);
  close();
 }}
 on:keydown={e => {
  if (open && e.key === 'Escape') close();
 }}
/>

<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
<div
 bind:this={ref}
 role="menu"
 tabindex="-1"
 data-direction={direction}
 data-level={level}
 class:context-menu={true}
 class:context-menu-open={open}
 style:left="{x}px"
 style:top="{y}px"
 {...$$restProps}
 on:mousedown
 on:mousedown={({ target }) => {
  console.log('context-menu mousedown:', target);
  const closestOption = target.closest('[tabindex]');
  if (closestOption && closestOption.getAttribute('role') !== 'menuitem') {
   console.log('context-menu mousedown close:', closestOption);
   close();
  }
 }}
 on:keydown
 on:keydown={e => {
  if (open) e.preventDefault();
  if ($hasPopup) return;
  if (e.key === 'ArrowDown') {
   if (focusIndex < options.length - 1) focusIndex++;
  } else if (e.key === 'ArrowUp') {
   if (focusIndex === -1) focusIndex = options.length - 1;
   else if (focusIndex > 0) focusIndex--;
  }
 }}
>
 <slot />
</div>
