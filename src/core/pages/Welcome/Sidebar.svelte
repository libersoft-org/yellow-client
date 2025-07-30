<script lang="ts">
	import { accounts_config } from '@/core/scripts/core.ts';
	import SidebarButton from '@/core/components/Sidebar/SidebarButton.svelte';
	import { welcomeWizardWindow } from '@/core/scripts/stores.ts';
	const hasNoAccounts = $derived($accounts_config.length === 0);

	function openWizard() {
		$welcomeWizardWindow?.open();
	}
</script>

<div class="welcome-sidebar">
	{#if hasNoAccounts}
		<SidebarButton img="img/accounts-add.svg" text="Open welcome wizard" onClick={openWizard} />
	{/if}
</div>
