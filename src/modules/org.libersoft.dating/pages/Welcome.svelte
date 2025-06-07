<script lang="ts">
	import { closeModule } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
</script>

<TopBar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Dating" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/close.svg" onClick={closeModule} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</TopBar>
<Page>Welcome</Page>
