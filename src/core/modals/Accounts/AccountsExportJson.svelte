<script>
	import Code from '@/core/components/Code/Code.svelte';
	let { code = $bindable() } = $props();
</script>

<Code bind:code />
