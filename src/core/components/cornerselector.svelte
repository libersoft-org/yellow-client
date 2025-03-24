<script>
 import Corner from './cornerselector-corner.svelte';
 export let value = 'top-right';

 function selectCorner(corner) {
  value = corner;
 }
</script>

<style>
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

<div class="cornerselector">
 <div class="row">
  <Corner active={value === 'top-left'} onClick={() => selectCorner('top-left')} />
  <Corner active={value === 'top-right'} onClick={() => selectCorner('top-right')} />
 </div>
 <div class="row">
  <Corner active={value === 'bottom-left'} onClick={() => selectCorner('bottom-left')} />
  <Corner active={value === 'bottom-right'} onClick={() => selectCorner('bottom-right')} />
 </div>
</div>
