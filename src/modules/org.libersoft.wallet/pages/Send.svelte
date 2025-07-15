<script lang="ts">
	import { getEtherAmount, estimateTransactionFee, updateFeeFromLevel, updateCustomFeeTransactionTime, feeLoading, transactionTimeLoading, feeLevel, fee, transactionTime, type IPayment } from '@/org.libersoft.wallet/scripts/transaction.ts';
	import { sendAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { selectedNetwork, currencies } from '@/org.libersoft.wallet/scripts/network.ts';
	import { selectedAddress } from '@/org.libersoft.wallet/scripts/wallet.ts';
	import { module } from '@/org.libersoft.wallet/scripts/module.ts';
	import { provider } from '@/org.libersoft.wallet/scripts/provider.ts';
	import { formatEther } from 'ethers';
	import Table from '@/core/components/Table/Table.svelte';
	import Tbody from '@/core/components/Table/TableTbody.svelte';
	import Tr from '@/core/components/Table/TableTbodyTr.svelte';
	import Td from '@/core/components/Table/TableTbodyTd.svelte';
	import Label from '@/core/components/Label/Label.svelte';
	import Button from '@/core/components/Button/Button.svelte';
	import Input from '@/core/components/Input/Input.svelte';
	import Alert from '@/core/components/Alert/Alert.svelte';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import DropdownFilter from '@/core/components/Dropdown/DropdownFilter.svelte';
	import Form from '@/core/components/Form/Form.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import DialogSend from '@/org.libersoft.wallet/dialogs/SendConfirmation.svelte';
	let currency: string | null | undefined = $state();
	let amount: string | number | undefined = $state(0);
	let error: string | null | undefined = $state();
	let elDialogSend: DialogSend | undefined = $state();
	let payment: IPayment | undefined = $state();
	let currentBalance: string | undefined = $state();
	let remainingBalance: string | undefined = $state();

	$effect(() => {
		if ($provider && $selectedNetwork && $selectedAddress) {
			estimateTransactionFee();
			updateBalance();
		}
	});

	$effect(() => {
		if ($feeLevel) updateFeeFromLevel();
	});

	$effect(() => {
		// Update transaction time when custom fee changes
		if ($feeLevel === 'custom' && $fee) updateCustomFeeTransactionTime();
	});

	$effect(() => {
		console.log('updateBalance effect triggered');
		updateRemainingBalance();
	});

	async function updateBalance() {
		try {
			// Use provider directly to get balance
			const p = $provider;
			const addr = $selectedAddress;
			if (p && addr) {
				const balanceWei = await p.getBalance(addr.address);
				const balanceEth = formatEther(balanceWei);
				currentBalance = balanceEth;
			}
		} catch (e) {
			console.error('Error updating balance:', e);
		}
	}

	function updateRemainingBalance() {
		if (!currentBalance || !amount || !$fee) {
			remainingBalance = undefined;
			return;
		}

		try {
			const balanceEth = parseFloat(currentBalance);
			const amountEth = parseFloat(amount.toString());
			const feeEth = parseFloat($fee.toString());
			if (isNaN(balanceEth) || isNaN(amountEth) || isNaN(feeEth)) {
				remainingBalance = undefined;
				return;
			}
			const remaining = balanceEth - amountEth - feeEth;
			remainingBalance = remaining.toFixed(6);
		} catch (e) {
			remainingBalance = undefined;
		}
	}

	async function setMaxAmount() {
		if (!currentBalance || !$fee) return;
		try {
			const balanceEth = parseFloat(currentBalance);
			const feeEth = parseFloat($fee.toString());
			if (isNaN(balanceEth) || isNaN(feeEth)) return;
			const maxAmount = balanceEth - feeEth;
			if (maxAmount > 0) amount = maxAmount.toFixed(6);
			else amount = '0';
		} catch (e) {
			console.error('Error setting max amount:', e);
		}
	}

	async function send() {
		error = null;
		const paymentAddress = $sendAddress;
		if (!paymentAddress) {
			error = 'Address is required';
			return;
		}
		const etherAmount = getEtherAmount(amount);
		if (!etherAmount) {
			error = 'Invalid amount';
			return;
		}
		const etherFee = getEtherAmount($fee);
		if (!etherFee) {
			error = 'Invalid fee';
			return;
		}
		payment = {
			address: paymentAddress.toString(),
			amount: etherAmount,
			fee: etherFee,
			currency: currency,
		};
		elDialogSend?.open();
	}
</script>

<style>
	.send {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.fee {
		display: flex;
		gap: 10px;
		align-items: center;
		width: 100%;
	}

	.row {
		display: flex;
		gap: 10px;
		align-items: center;
		width: 100%;
	}
</style>

<div class="send">
	<Form onSubmit={send} width="400px">
		<Label text="Address">
			<Input bind:value={$sendAddress} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Currency">
			<DropdownFilter options={$currencies} enabled={!!($selectedNetwork && $selectedAddress)} />
		</Label>
		<Label text="Amount">
			<div class="row">
				<Input bind:value={amount} enabled={!!($selectedNetwork && $selectedAddress)} />
				<Button img="modules/{module.identifier}/img/max.svg" text="Max" enabled={!!($selectedNetwork && $selectedAddress && currentBalance && $fee)} onClick={setMaxAmount} />
			</div>
		</Label>
		<Label text="Transaction fee">
			<div class="fee">
				<Select bind:value={$feeLevel} enabled={!!($selectedNetwork && $selectedAddress)} minWidth="120px">
					<Option value="low" text="Low (slow)" />
					<Option value="average" text="Average" />
					<Option value="high" text="High (fast)" />
					<Option value="custom" text="Custom" />
				</Select>
				{#if $feeLevel === 'custom'}
					<Input bind:value={$fee} enabled={!!($selectedNetwork && $selectedAddress)} placeholder="Enter custom fee" />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{:else if $feeLoading}
					<Spinner size="20px" />
				{:else}
					<Input bind:value={$fee} enabled={false} />
					<div>{$selectedNetwork?.currency?.symbol || ''}</div>
				{/if}
				{#if !$feeLoading && $feeLevel !== 'custom' && $provider && $selectedNetwork && $selectedAddress}
					<Icon img="img/reset.svg" alt="Refresh" colorVariable="--primary-foreground" size="30px" padding="0" onClick={estimateTransactionFee} />
				{/if}
			</div>
		</Label>
		<Table>
			<Tbody>
				<Tr>
					<Td bold>Estimated transaction time:</Td>
					<Td>
						{#if $transactionTimeLoading}
							<Spinner size="12px" />
						{:else}
							{$transactionTime}
						{/if}
					</Td>
				</Tr>
				<Tr>
					<Td bold>Current balance:</Td>
					<Td>
						{#if currentBalance !== undefined}
							{currentBalance} {$selectedNetwork?.currency?.symbol || ''}
						{:else}
							<Spinner size="12px" />
						{/if}
					</Td>
				</Tr>
				<Tr>
					<Td bold>Balance after transaction:</Td>
					<Td>
						{#if remainingBalance !== undefined}
							{remainingBalance} {$selectedNetwork?.currency?.symbol || ''}
						{:else}
							<Spinner size="12px" />
						{/if}
					</Td>
				</Tr>
			</Tbody>
		</Table>
		{#if error}
			<Alert type="error" message={error} />
		{/if}
		<Button img="modules/{module.identifier}/img/send.svg" text="Send" enabled={!!($selectedNetwork && $selectedAddress)} onClick={send} />
	</Form>
</div>
<DialogSend params={payment} bind:this={elDialogSend} />
