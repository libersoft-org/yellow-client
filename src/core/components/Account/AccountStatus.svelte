<script lang="ts">
	interface Props {
		account?: any;
	}
	let { account }: Props = $props();
</script>

{#if $account.enabled}
	{#if $account.error}
		{$account.error},
	{/if}
	{#if $account.session_status}
		{$account.session_status}
	{:else}
		{$account.status}
	{/if}
{:else}
	{$account.status}
{/if}
