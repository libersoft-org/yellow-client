<script>
 export let account;
</script>

{#if $account.error}
 {$account.error},
{/if}

{#if $account.session_status}
 {$account.session_status}
{:else}
 {$account.status}
{/if}
