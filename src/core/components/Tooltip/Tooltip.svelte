<script lang="ts">
  import { computePosition, shift, offset } from '@floating-ui/dom';
  import Portal from '@/core/components/Portal/Portal.svelte';

  interface TooltipProps {
    targetRef: HTMLElement;
    children?: any;
  }

  let { targetRef, children }: TooltipProps = $props();

  let floatingRef: HTMLElement;

  const setupFloatingUI = () => {
    computePosition(targetRef, floatingRef, {
      placement: 'top',
      middleware: [
        // autoPlacement({
        //  alignment: 'start',
        //  allowedPlacements: ['top-start', 'top-end'],
        // }),
        shift(),
        offset(8),
      ],
    }).then(({ x, y }) => {
      Object.assign(floatingRef.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  };

  $effect(() => {
    if (targetRef) {
      setupFloatingUI();
    }
  });
</script>

<Portal>
  <div class="tooltip" bind:this={floatingRef}>
    {@render children?.()}
  </div>
</Portal>

<style>
  .tooltip {
    position: absolute;
    width: max-content;
    top: 0;
    left: 0;

    background-color: #000000d6;
    border-radius: 6px;
    color: white;
    padding: 6px;
    font-size: 12px;
    line-height: 16px;
  }
</style>
