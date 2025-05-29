<script>
  import BaseButton from '@/core/components/Button/BaseButton.svelte';
  import Icon from '@/core/components/Icon/Icon.svelte';
  export let visible = true;
  export let direction = false;
  export let left;
  export let right;
  export let top;
  export let bottom;
  export let onClick;
  let size = 30;
</script>

{#if visible}
  <BaseButton {onClick}>
    <div
      class="scroll-button"
      style="--size: {size}px; {top ? 'top: ' + top + ';' : ''} {bottom ? 'bottom: ' + bottom + ';' : ''} {left
        ? 'left: ' + left + ';'
        : ''} {right ? 'right: ' + right + ';' : ''}"
    >
      <Icon
        img="img/caret-{direction ? 'up' : 'down'}.svg"
        alt={direction ? '˄' : '˅'}
        colorVariable="--icon-gray"
        size="32px"
        padding="0px"
      />
    </div>
  </BaseButton>
{/if}

<style>
  .scroll-button {
    z-index: 99;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--size);
    width: var(--size);
    min-height: var(--size);
    height: var(--size);
    padding: 10px;
    border: 2px solid #aaa;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: var(--shadow);
  }
</style>
