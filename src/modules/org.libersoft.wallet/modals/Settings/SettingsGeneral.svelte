<script>
	import Label from '@/core/components/Label/Label.svelte';
	import Select from '@/core/components/Select/Select.svelte';
	import Option from '@/core/components/Select/SelectOption.svelte';
</script>

<Label text="Currency conversion">
	<Select>
		<Option value="1" text="USD" selected />
	</Select>
</Label>
