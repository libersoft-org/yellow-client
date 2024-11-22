<script>
 export let acc;
</script>

{#if acc.error}
 {acc.error},
{/if}

{#if acc.session_status}
 {acc.session_status}
{:else}
 {acc.status}
{/if}
