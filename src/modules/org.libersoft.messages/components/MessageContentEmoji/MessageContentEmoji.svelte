<script lang="ts">
	import Emoji from '../Emoji/Emoji.svelte';
	let { node, level, num_siblings } = $props();
	let codepoints_str = $derived(node.attributes.codepoints?.value);
	let codepoints = $derived.by(() => {
		if (!codepoints_str) {
			console.log('codepoints is empty:', node);
			return null;
		}
		try {
			return codepoints_str.split('_').map(cp => parseInt(cp, 16));
		} catch (e) {
			console.log('Error parsing codepoints:', e);
			return null;
		}
	});
	let is_single = $derived(num_siblings === 1 && level === 0);
</script>

{#if codepoints}
	<Emoji {codepoints} context={'message'} {is_single} size={is_single ? 200 : 30} force_animate />
{:else}
	error: {JSON.stringify(node.attributes)}
{/if}
