<script>
	import Code from '../../components/Code/Code.svelte';
	import { accounts_config } from '../../core.ts';
</script>

<Code code={JSON.stringify($accounts_config, null, 2)} />
