<script lang="ts">
	import Label from '@/core/components/Label/Label.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
	import { fiat } from 'libersoft-crypto/fiat';

	const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CZK'];
</script>

<Label text="Currency conversion">
	<Select bind:value={$fiat}>
		{#each currencies as currency}
			<Option value={currency}>{currency}</Option>
		{/each}
	</Select>
</Label>
