<script lang="ts">
	import { accounts_config } from '@/core/scripts/core.ts';
	import Window from '@/core/components/Window/Window.svelte';
	import Export from '@/core/components/Export/Export.svelte';
	let elWindow;

	export function open() {
		elWindow?.open();
	}

	export function close() {
		elWindow?.close();
	}
</script>

<Window title="Export accounts" bind:this={elWindow} testId="accounts-export" width="600px" height="500px">
	<Export data={$accounts_config} filename="accounts" testId="accounts-export" isSensitive />
</Window>
