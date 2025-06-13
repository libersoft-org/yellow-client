<script lang="ts">
	import Export from '@/core/components/Export/Export.svelte';
	import { addressBook } from '../../wallet.ts';
	import { get } from 'svelte/store';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	const exportData = get(addressBook);
</script>

<Export data={exportData} filename="addressbook" enableJsonTab={true} enableQrTab={true} isSensitive={true} testId="addressbook-export" />
