<script lang="ts">
	import { accounts_config } from '@/core/scripts/core.ts';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Export from '@/core/components/Export/Export.svelte';
	let elModal;

	export function open() {
		elModal?.open();
	}

	export function close() {
		elModal?.close();
	}
</script>

<Modal title="Export accounts" bind:this={elModal} testId="accounts-export" width="600px" height="500px">
	<Export data={$accounts_config} filename="accounts" testId="accounts-export" isSensitive />
</Modal>
