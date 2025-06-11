<script>
	import { accounts_config } from '@/core/core.ts';
	import Export from '@/core/components/Export/Export.svelte';
</script>

<Export data={$accounts_config} filename="accounts" testId="accounts-export" />
