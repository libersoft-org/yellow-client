<script>
  import CornerSelectorCorner from './CornerSelectorCorner.svelte';
  export let value = 'top-right';
  export let disabled = false;

  function selectCorner(corner) {
    if (disabled) return;
    value = corner;
  }
</script>

<div class="cornerselector {disabled ? 'disabled' : ''}">
  <div class="row">
    <CornerSelectorCorner active={value === 'top-left'} onClick={() => selectCorner('top-left')} />
    <CornerSelectorCorner active={value === 'top-right'} onClick={() => selectCorner('top-right')} />
  </div>
  <div class="row">
    <CornerSelectorCorner active={value === 'bottom-left'} onClick={() => selectCorner('bottom-left')} />
    <CornerSelectorCorner active={value === 'bottom-right'} onClick={() => selectCorner('bottom-right')} />
  </div>
</div>

<style>
  .disabled {
    opacity: 0.5;
  }

  .cornerselector {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .row {
    display: flex;
    gap: 5px;
  }
</style>
