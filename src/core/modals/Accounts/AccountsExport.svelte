<script lang="ts">
	import { accounts_config } from '@/core/core.ts';
	import Modal from '@/core/components/Modal/Modal.svelte';
	import Export from '@/core/components/Export/Export.svelte';
	interface Props {
		show?: boolean;
	}
	let { show = $bindable(false) }: Props = $props();
</script>

<Modal title="Export accounts" bind:show>
	{#snippet top()}
		<Export data={$accounts_config} filename="accounts" testId="accounts-export" isSensitive />
	{/snippet}
</Modal>
