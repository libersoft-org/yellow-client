<script lang="ts">
	import { debug } from '@/core/scripts/stores.ts';
	import { isInitialized, trezorLoading, trezorError, trezorState } from '@/org.libersoft.wallet/scripts/trezor';
</script>

{#if $debug}
	<div class="debug-info">
		<strong>Debug Info:</strong><br />
		SDKisInitialized: {$isInitialized}<br />
		trezorLoading: {$trezorLoading}<br />
		trezorError: {$trezorError || 'None'}<br />
		trezorState:
		<pre>{JSON.stringify($trezorState, null, 2) || 'None'}</pre>
	</div>
{/if}
