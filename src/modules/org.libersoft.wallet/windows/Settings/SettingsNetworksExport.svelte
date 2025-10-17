<script lang="ts">
	import { networks } from 'libersoft-crypto/network';
	import Export from '@/core/components/Export/Export.svelte';
	interface Props {
		close: () => void;
	}
	let { close }: Props = $props();
</script>

<Export data={$networks} filename="networks" testId="networks-export" isSensitive />
