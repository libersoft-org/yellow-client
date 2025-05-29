<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';

	interface Props extends HTMLTdAttributes {
		center?: boolean;
		children?: any;
	}

	let { center = false, children, ...restProps }: Props = $props();
</script>

<style>
	td {
		padding: 10px;
	}

	td.center {
		text-align: center;
	}
</style>

<td {...restProps} class:center>
	{@render children()}
</td>
