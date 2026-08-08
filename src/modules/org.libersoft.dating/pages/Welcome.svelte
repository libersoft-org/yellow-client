<script lang="ts">
	import { closeModule } from '../scripts/dating.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
</script>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="Dating" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/cross.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</Bar>
<Page>Welcome</Page>
