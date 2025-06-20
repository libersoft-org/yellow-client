<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { addAccount, findAccountConfig, saveAccount } from '@/core/accounts_config.ts';
	import { accounts, accountConfigExistsByCredentials } from '@/core/core.ts';
	import Button from '@/core/components/Button/Button.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import Switch from '@/core/components/Switch/Switch.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import AccountStatusIconIconAndText from '@/core/components/Account/AccountStatusIconIconAndText.svelte';
	import { get, writable, derived } from 'svelte/store';
	interface Props {
		close: () => void;
		params: { id: string | null };
		isInWelcomeWizard?: boolean;
		save_id?: (id: string) => void;
	}
	let { close, params, isInWelcomeWizard = false, save_id }: Props = $props();
	let protocolElem: any = null;
	let protocol = $state('amtp');
	let error = $state('');
	let credentials_address = $state('');
	let credentials_server = $state('');
	let credentials_password = $state('');
	let config_enabled = $state(isInWelcomeWizard);
	let config_title = $state('');
	let retry_nonce = $state(0);
	type WizardContext = {
		setNextText: (text: string) => void;
	};
	let wizard = getContext<WizardContext>('wizard');
	let account_id_store = writable<string | null>(null);
	//console.log('[INIT] Modal mounted. Params:', params);

	$effect(() => {
		console.log('[EFFECT] Updating account_id_store from params.id =', params.id);
		account_id_store.set(params.id);
	});

	// Watch account_id_store changes to reset form for new accounts
	$effect(() => {
		const id = $account_id_store;
		console.log('[EFFECT] account_id_store changed to:', id);

		if (id === null) {
			console.log('[EFFECT] Resetting form for new account');
			credentials_address = '';
			credentials_server = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/';
			credentials_password = '';
			config_enabled = isInWelcomeWizard || true;
			config_title = 'My account';
		}
	});

	/*
	// Observe full accounts store for debug
	accounts.subscribe(value => {
		console.log('[STORE] Full accounts store updated:', value.map(get));
	});
*/
	let account = derived([accounts, account_id_store], ([$accounts, $account_id_store]) => {
		const id = $account_id_store;
		if (!id) {
			//console.log('[DERIVED] No account ID set, returning null');
			return null;
		}
		//console.log('[DERIVED] Finding account with ID:', id);
		const found = $accounts.find(acc => get(acc).id === id);
		//console.log('[DERIVED] $account_id_store =', id, '→ found account:', found ? get(found) : null);
		return found ?? null;
	});
	/*
	account.subscribe(value => {
		if (value) {
			console.log('[SUBSCRIBE] Account updated:', value);
		} else {
			console.log('[SUBSCRIBE] No account found');
		}
	});
	*/
	$effect(() => {
		protocolElem?.focus();
		//console.log('[EFFECT] Checking if params.id exists:', params.id);

		if (params.id !== null) {
			let found = findAccountConfig(params.id);
			console.log('[EFFECT] Loaded existing config:', found);
			if (found?.credentials) {
				credentials_address = found.credentials.address;
				credentials_server = found.credentials.server;
				credentials_password = found.credentials.password;
			}
			config_enabled = found?.enabled ?? true;
			config_title = found?.settings?.title ?? 'My account';
		} else {
			console.log('[EFFECT] New account setup - form will be reset by account_id_store watcher');

			if (isInWelcomeWizard) {
				untrack(() => {
					console.log('[EFFECT] In welcome wizard, setting skip');
					wizard?.setNextText('Skip');
				});
			}
		}
		return () => {
			console.log('[EFFECT] Cleanup on unmount');
			wizard?.setNextText('Next');
		};
	});

	function verify() {
		if (!credentials_server) {
			error = 'Server address is required';
			console.warn('[VERIFY] Server address is missing');
			return false;
		}
		if (!credentials_address) {
			error = 'Address is required';
			console.warn('[VERIFY] Address is missing');
			return false;
		}
		// Check if account already exists when adding new account
		if (params.id === null && accountConfigExistsByCredentials(credentials_server, credentials_address)) {
			error = 'Account with this server and address already exists';
			console.warn('[VERIFY] Account already exists:', credentials_server, credentials_address);
			return false;
		}
		error = '';
		return true;
	}

	function clickAdd() {
		console.log('[ACTION] Clicked ADD');
		if (!verify()) return;
		const id = addAccount(
			{
				enabled: config_enabled,
				credentials: {
					address: credentials_address,
					server: credentials_server,
					password: credentials_password,
				},
			},
			{
				title: config_title,
			}
		);
		console.log('[ACTION] Account added with ID:', id);
		params.id = id;
		save_id?.(id);
		wizard?.setNextText('Next');
		close();
	}

	function clickSave() {
		console.log('[ACTION] Clicked SAVE for ID:', params.id);
		if (!verify()) return;
		if (params.id === null) {
			console.error('[ERROR] Cannot save account without ID');
			return;
		}
		saveAccount(
			params.id,
			{
				enabled: config_enabled,
				credentials: {
					address: credentials_address,
					server: credentials_server,
					password: credentials_password,
					retry_nonce,
				},
			},
			{
				title: config_title,
			}
		);
		console.log('[ACTION] Account saved:', params.id);
		retry_nonce++;
		save_id?.(params.id);
		wizard?.setNextText('Next');
		close();
	}

	function keyEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			console.log('[KEY] Enter pressed');
			params.id === null ? clickAdd() : clickSave();
		}
	}
</script>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 5px;
	}
</style>

<div class="form">
	<Label text="Protocol">
		<Select minWidth="300px" maxWidth="300px" bind:this={protocolElem} bind:value={protocol}>
			<Option text="AMTP" value="amtp" selected={protocol === 'amtp'} />
			<Option text="DMTP (not yet implemented)" value="dmtp" disabled selected={protocol === 'dmtp'} />
		</Select>
	</Label>
	<Label text="Title">
		<Input minWidth="300px" maxWidth="300px" bind:value={config_title} onKeydown={keyEnter} data-testid="account-title-input" />
	</Label>
	<Label text="Server">
		<Input minWidth="300px" maxWidth="300px" placeholder="wss://your_server/" bind:value={credentials_server} onKeydown={keyEnter} data-testid="account-server-input" />
	</Label>
	<Label text="Address">
		<Input minWidth="300px" maxWidth="300px" placeholder="user@domain.tld" bind:value={credentials_address} onKeydown={keyEnter} data-testid="account-address-input" />
	</Label>
	<Label text="Password">
		<Input minWidth="300px" maxWidth="300px" type="password" placeholder="Your password" bind:value={credentials_password} onKeydown={keyEnter} data-testid="account-password-input" />
	</Label>
	{#if !isInWelcomeWizard}
		<Switch showLabel label="Enabled" bind:checked={config_enabled} data-testid="account-enabled-checkbox" />
	{/if}
	{#if error}
		<Alert type="error" message={error} />
	{/if}
	{#if params.id === null}
		<Button data-testid="add" img="img/accounts-add.svg" text="Add the account" onClick={clickAdd} />
	{:else}
		<Button data-testid="save" img="img/save.svg" text="Save" onClick={clickSave} />
	{/if}
	{#if $account}
		<div class="status">
			<strong>Status:</strong>
			<AccountStatusIconIconAndText account={$account} />
		</div>
	{/if}
</div>
