<script>
 import Corner from './cornerselector-corner.svelte';
 export let selectedCorner = 4;

 function selectCorner(corner) {
  selectedCorner = corner;
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
  <Corner active={selectedCorner === 1} onClick={() => selectCorner(1)} />
  <Corner active={selectedCorner === 2} onClick={() => selectCorner(2)} />
 </div>
 <div class="row">
  <Corner active={selectedCorner === 3} onClick={() => selectCorner(3)} />
  <Corner active={selectedCorner === 4} onClick={() => selectCorner(4)} />
 </div>
</div>
