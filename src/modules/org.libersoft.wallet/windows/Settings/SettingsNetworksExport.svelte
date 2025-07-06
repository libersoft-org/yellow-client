<script lang="ts">
	import { networks } from '../../scripts/wallet.ts';
	import Export from '@/core/components/Export/Export.svelte';
</script>

<Export data={$networks} filename="networks" testId="networks-export" isSensitive />
