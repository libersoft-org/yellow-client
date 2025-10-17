<script lang="ts">
	import { module } from '@/org.libersoft.wallet/scripts/module';
	import Icon from '@/core/components/Icon/Icon.svelte';

	interface Props {
		iconURL?: string | null;
		symbol?: string | null;
		size?: string;
	}

	let { iconURL, symbol, size = '40px' }: Props = $props();
</script>

<span class="td__icon">
	<Icon img={iconURL || 'modules/' + module.identifier + '/img/token.svg'} alt={symbol || '?'} {size} padding="0px" />
</span>
