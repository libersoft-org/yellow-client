<script>
  import Code from '../../components/Code/Code.svelte';
  import { accounts_config } from '../../core.js';
</script>

<Code code={JSON.stringify($accounts_config, null, 2)} />
