<script>
	import { onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { debug, active_account, accounts, selectAccount, selected_corepage_id, hideSidebarMobile } from '../../core.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import BaseButton from '@/core/components/Button/BaseButton.svelte';
	import AccountBarItem from './AccountBarItem.svelte';
	import AccountBarButton from './AccountBarButton.svelte';
	import AccountStatusIcon from './AccountStatusIcon.svelte';
	import AccountTitle from './AccountTitle.svelte';

	let accountsVisible = $state(false);
	let accountBar;

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
		if (!$debug) {
			document.addEventListener('click', handleClickOutside);
		}
	}

	function close() {
		accountsVisible = false;
		document.removeEventListener('click', handleClickOutside);
	}

	function toggle() {
		if (accountsVisible) {
			close();
		} else {
			open();
		}
	}

	function clickSelectAccount(id) {
		selectAccount(id);
		close();
	}

	function handleClickOutside(event) {
		if (accountBar && !accountBar.contains(event.target)) {
			close();
		}
	}

	function clickAccountManagement() {
		selected_corepage_id.set('accounts');
		hideSidebarMobile.set(true);
		close();
	}
</script>

<style>
	.account-bar {
		position: relative;
		font-weight: bold;
		background-color: #222;
		color: #fff;
	}

	.dropdown {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border-bottom: 1px solid #555;
		width: 100%;
		box-sizing: border-box;

		:global(.icon) {
			transform: rotate(0deg);
			transition: transform 0.3s ease;
		}

		:global(&.is-expanded .icon) {
			transform: rotate(180deg);
		}
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
		flex-direction: column;
		position: absolute;
		top: 100%;
		left: 0;
		background-color: #333;
		z-index: 1000;
		width: 100%;
		overflow: hidden;
		transition: none;

		:global(& > .base-button) {
			width: 100% !important;

			:global(& > .item) {
				width: 100%;
			}
		}
	}
</style>

<div class="account-bar" bind:this={accountBar}>
	<BaseButton data-testid="account-bar-toggle" name="account-bar-toggle" onClick={toggle} width="100%">
		<div class={`dropdown`} class:is-expanded={accountsVisible}>
			{#if $active_account}
				<div class="text">
					<AccountStatusIcon account={active_account} />
					<AccountTitle a={active_account} />
				</div>
			{:else}
				{#if $accounts.length > 0}
					<div class="text">SELECT YOUR ACCOUNT</div>
				{/if}
				{#if $accounts.length === 0}
					<div class="text">CREATE ACCOUNT FIRST</div>
				{/if}
			{/if}
			<Icon img={'img/down.svg'} alt={accountsVisible ? '▲' : '▼'} colorVariable="--icon-white" size="20px" padding="0px" />
		</div>
	</BaseButton>
	{#if accountsVisible}
		<div class="items" transition:animateHeight={{ duration: 220 }}>
			{#each $accounts as a (get(a).id)}
				<AccountBarItem {a} {clickSelectAccount} />
			{/each}
			<AccountBarButton img="img/accounts.svg" title="Account management" onClick={clickAccountManagement} />
		</div>
	{/if}
</div>
