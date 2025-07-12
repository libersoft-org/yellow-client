<script lang="ts">
	import Export from '@/core/components/Export/Export.svelte';
	import { addressBook } from '@/org.libersoft.wallet/scripts/addressbook.ts';
	import { get } from 'svelte/store';

	interface Props {
		close: () => void;
	}

	let { close }: Props = $props();

	const exportData = get(addressBook);
</script>

<Export data={exportData} filename="addressbook" enableJsonTab enableQrTab isSensitive testId="addressbook-export" />
