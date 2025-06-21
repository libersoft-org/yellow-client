<script>
	import { networks } from '../../wallet.ts';
	import Export from '@/core/components/Export/Export.svelte';
</script>

<Export data={$networks} filename="accounts" testId="accounts-export" />
