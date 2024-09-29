<script>
 export let items = null;
 export let noOptionID = 0;
 export let noOptionText = '---';
</script>

<style>
 .dropdown {
  padding: 5px;
  border: 0;
  border-radius: 10px;
  font-family: inherit;
  background-color: #ffa;
  cursor: pointer;
 }
</style>

<select class="dropdown">
 {#if items}
  {#each items as i (i.id)}
   <option id="{i.id}">{i.text}</option>
  {/each}
 {:else}
  <option id="{noOptionID}">{noOptionText}</option>
 {/if}
</select>
