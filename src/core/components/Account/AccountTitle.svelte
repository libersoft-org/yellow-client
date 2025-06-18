<script>
	export let account;
</script>

<style>
	.account-title {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
</style>

<div class="account-title">
	{#if $account.settings?.title}{$account.settings?.title} ({/if}{$account.credentials?.address}{#if $account.settings?.title}){/if}
</div>
