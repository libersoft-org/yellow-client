<script lang="ts">
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { debug, active_account, accounts, selectAccount, hideSidebarMobile, setCorePage } from '@/core/core.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import ItemAccount from '@/core/components/Account/AccountBarItemAccount.svelte';
	import ItemBase from '@/core/components/Account/AccountBarItemBase.svelte';
	import AccountStatusIcon from '@/core/components/Account/AccountStatusIcon.svelte';
	import AccountTitle from '@/core/components/Account/AccountTitle.svelte';
	let accountsVisible = $state(false);
	let accountBar: HTMLElement | undefined;

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
	});

	//$: console.log('account-bar.svelte: account: ', $active_account);
	//$: console.log('account-bar.svelte: accounts: ', $accounts);
	//$: console.log('accountsVisible: ', accountsVisible);

	function animateHeight(node, { duration = 220 } = {}) {
		const style = getComputedStyle(node);
		const paddingTop = parseFloat(style.paddingTop);
		const paddingBottom = parseFloat(style.paddingBottom);
		const height = node.scrollHeight - paddingTop - paddingBottom;
		return {
			duration,
			css: t => `
				overflow: hidden;
				max-height: ${t * height + paddingTop + paddingBottom}px;
			`,
		};
	}

	function open() {
		accountsVisible = true;
		if (!$debug) document.addEventListener('click', handleClickOutside);
	}

	function close() {
		accountsVisible = false;
		document.removeEventListener('click', handleClickOutside);
	}

	function toggle() {
		accountsVisible ? close() : open();
	}

	function clickSelectAccount(id) {
		selectAccount(id);
		close();
	}

	function handleClickOutside(event) {
		if (accountBar && !accountBar.contains(event.target)) close();
	}

	function clickAccountManagement() {
		setCorePage('accounts');
		hideSidebarMobile.set(true);
		close();
	}
</script>

<style>
	.account-bar {
		position: relative;
		font-weight: bold;
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.dropdown {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-bottom: 1px solid var(--secondary-softer-background);
		width: 100%;
		box-sizing: border-box;
	}

	.dropdown :global(.icon) {
		transform: rotate(0deg);
		transition: transform 0.3s ease;
	}

	.dropdown.is-expanded :global(.icon) {
		transform: rotate(180deg);
	}

	.dropdown .text {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: 1 1 auto;
		min-width: 0;
		/* width: 100%; */
	}

	.items {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--secondary-background);
		z-index: 1000;
		width: 100%;
		overflow: hidden;
		transition: none;
		border-bottom: 1px solid var(--secondary-softer-background);
	}

	.account-bar > :global(.clickable) {
		width: 100%;
	}
</style>

<div class="account-bar" bind:this={accountBar}>
	<Clickable data-testid="account-bar-toggle" name="account-bar-toggle" onClick={toggle}>
		<div class={`dropdown`} class:is-expanded={accountsVisible}>
			{#if $active_account}
				<div class="text">
					<AccountStatusIcon account={active_account} />
					<AccountTitle a={active_account} />
				</div>
			{:else}
				{#if $accounts.length > 0}
					<div class="text">-- SELECT YOUR ACCOUNT --</div>
				{/if}
				{#if $accounts.length === 0}
					<div class="text">-- CREATE ACCOUNT FIRST --</div>
				{/if}
			{/if}
			<Icon img={'img/down.svg'} alt={accountsVisible ? '▲' : '▼'} colorVariable="--secondary-foreground" size="20px" padding="0px" />
		</div>
	</Clickable>
	{#if accountsVisible}
		<div class="items" transition:animateHeight={{ duration: 220 }}>
			{#each $accounts as account (get(account).id)}
				<ItemAccount {account} {clickSelectAccount} />
			{/each}
			<ItemBase img="img/accounts.svg" title="Account management" onClick={clickAccountManagement} />
		</div>
	{/if}
</div>
