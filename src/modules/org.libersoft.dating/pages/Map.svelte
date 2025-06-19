<script lang="ts">
	import { closePage } from '../dating.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Map from '../components/Map.svelte';
</script>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="Map" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/close.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</Bar>
<Page>
	<Map latitude="50.0755" longitude="14.4378" />
</Page>
