<script lang="ts">
	import Emoji from '../Emoji/Emoji.svelte';
	let { node, level, num_siblings } = $props();
	let codepoints_str = $state(node.attributes.codepoints?.value);
	let codepoints = $state(null);
	let is_single = $derived(num_siblings === 1 && level === 0);

	$effect(() => {
		updateCodepoints(codepoints_str);
	});

	function updateCodepoints(codepoints_str) {
		if (!codepoints_str) {
			console.log('codepoints is empty:', node);
			return;
		}
		try {
			codepoints = decodeCodepoints(codepoints_str);
		} catch (e) {
			console.log('Error parsing codepoints:', e);
		}
	}

	function decodeCodepoints(str) {
		return str.split('_').map(cp => parseInt(cp, 16));
	}
</script>

{#if codepoints}
	<Emoji {codepoints} context={'message'} {is_single} size={is_single ? 200 : 30} force_animate />
{:else}
	error: {JSON.stringify(node.attributes)}
{/if}
