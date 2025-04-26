<script lang="ts">
import Button from "@/core/components/Button/Button.svelte";
import BaseButton from "@/core/components/Button/BaseButton.svelte";
import Icon from "@/core/components/Icon/Icon.svelte";
import { identifier } from "@/org.libersoft.messages/messages";
import { autoPlacement, autoUpdate, computePosition, offset, shift } from "@floating-ui/dom";
import Portal from "svelte-portal";

interface Props {
}

let buttonRef: HTMLElement;
let floatingRef = $state<HTMLElement | null>(null);
let show = $state(false);

let autoPlacementCleanup: ReturnType<typeof handleFloatingUI>;
const onClick = () => {
 console.log('click');
 show = !show;
};

const handleOutsideClick = (e: MouseEvent) => {
 if (floatingRef && !floatingRef.contains(e.target as Node) && !buttonRef.contains(e.target as Node)) {
  show = false;
  document.removeEventListener('click', handleOutsideClick);
 }
};

const handleFloatingUI = () => {
 if (!buttonRef || !floatingRef) {
  return;
 }
 const autoUpdateCleanUp = autoUpdate(buttonRef, floatingRef, () => {
  computePosition(buttonRef, floatingRef, {
   middleware: [
    autoPlacement({
     alignment: 'start',
     allowedPlacements: ['top-start', 'top-end'],
     padding: 4,
    }),
    shift(),
    offset(8),
   ],
  }).then(({ x, y }) => {
   Object.assign(floatingRef.style, {
    left: `${x}px`,
    top: `${y}px`,
   });
  });
 });
 document.addEventListener('click', handleOutsideClick);
 return () => {
  autoUpdateCleanUp && autoUpdateCleanUp();
 };
};

$effect(() => {
 if (show) autoPlacementCleanup = handleFloatingUI();
 else {
  autoPlacementCleanup && autoPlacementCleanup();
 }
});

</script>

<div class="button-with-menu">
 <div class="side-button" onclick={onClick} role="button" tabindex="0" bind:this={buttonRef}>
   <slot name="side-button"></slot>
 </div>
 <div class="main-button">
  <slot name="main-button"></slot>
 </div>
</div>

{#if show}
 <Portal>
  <div bind:this={floatingRef} class="tooltip floating" style:display={show ? 'block' : 'none'}>
   <slot name="tooltip"></slot>
  </div>
 </Portal>
{/if}

<style>
 .button-with-menu {
  display: flex;
 }

 .side-button {
  display: flex;
  background: #fff19c;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  border: 1px solid #bb9900;
 }

 .main-button :global(.button) {
  display: flex;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-left: 0;
 }

 .tooltip {
  display: flex;
  align-items: center;
  background: var(--yellow-bg);
  padding: 8px;
  border-radius: 20px;
  box-shadow: var(--yellow-box-shadow);
  max-width: calc(100vh - 20px);
  z-index: 100000;
 }
</style>
