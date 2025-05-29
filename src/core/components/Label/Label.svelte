<script>
 export let text;
 export let row = false;
</script>

<style>
 label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  -webkit-tap-highlight-color: transparent;
 }

 label.row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
 }

 .text {
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
  cursor: pointer;
 }
</style>

<label class:row>
 {#if text}
  <div class="text">{text}:</div>
 {/if}
 <slot />
</label>
