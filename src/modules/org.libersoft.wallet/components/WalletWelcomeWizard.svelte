<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { wallets } from 'libersoft-crypto/wallet';
	import { networks } from 'libersoft-crypto/network';
	import { walletWelcomeWizardWindow } from '@/org.libersoft.wallet/scripts/ui';
	import Window from '@/core/components/Window/Window.svelte';
	import Wizard from '@/core/components/Wizard/Wizard.svelte';
	import WalletWizardStep1 from '@/org.libersoft.wallet/wizard/WelcomeStep1.svelte';
	import WalletWizardStep2 from '@/org.libersoft.wallet/wizard/WelcomeStep2.svelte';
	import WalletWizardStep3 from '@/org.libersoft.wallet/wizard/WelcomeStep3.svelte';
	import WalletWizardStep4 from '@/org.libersoft.wallet/wizard/WelcomeStep4.svelte';

	const wizardData = {
		steps: [
			{ title: 'Welcome to Wallet', component: WalletWizardStep1 },
			{ title: 'Configure Networks', component: WalletWizardStep2 },
			{ title: 'Create Your First Wallet', component: WalletWizardStep3 },
			{ title: "You're All Set!", component: WalletWizardStep4 },
		],
	};

	let elWalletWelcomeWizard;

	onMount(() => {
		walletWelcomeWizardWindow.set(elWalletWelcomeWizard);

		// Check if we should show wizard on mount
		checkAndShowWizard();
	});

	function checkAndShowWizard() {
		const walletsCount = get(wallets).length;
		const networksCount = get(networks).length;

		// Show wizard if no wallets or networks are configured
		if (walletsCount === 0 && networksCount === 0) {
			elWalletWelcomeWizard?.open();
		}
	}

	// Export function to manually open wizard
	export function openWizard() {
		elWalletWelcomeWizard?.open();
	}
</script>

<Window body={Wizard} bind:this={elWalletWelcomeWizard} params={wizardData} testId="wallet-welcome-wizard" title="Wallet Setup" />
