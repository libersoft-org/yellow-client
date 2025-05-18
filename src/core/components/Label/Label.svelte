<script>
 export let text;
</script>

<style>
 .label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  padding-left: 5px;
  font-weight: bold;
  cursor: pointer;
 }
</style>

<label>
 {#if text}
  <div class="label">{text}:</div>
 {/if}
 <slot />
</label>
