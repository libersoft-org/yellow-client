<script>
	import Code from '@/core/components/Code/Code.svelte';
	import { accounts_config } from '@/core/core.ts';
</script>

<Code code={JSON.stringify($accounts_config, null, 2)} />
