<script>
 export let phrase = '';
 let count = 0;
</script>

<style>
 .cell {
  padding: 5px;
  border: 1px solid #000;
 }
</style>

<table>
 <tr>
  <td>
   {#each phrase.split(' ').slice(0, 12) as word, index}
    <div class="cell">{index + 1}. {word}</div>
   {/each}
  </td>
  <td>
   {#each phrase.split(' ').slice(12) as word, index}
    <div class="cell">{index + 13}. {word}</div>
   {/each}
  </td>
 </tr>
</table>
