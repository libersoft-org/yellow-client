<script lang="ts">
	import Label from '@/core/components/Label/Label.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';

	let currencyConversion = $state('1');
</script>

<Label text="Currency conversion">
	<Select bind:value={currencyConversion}>
		<Option value="1" text="USD" selected />
	</Select>
</Label>
