<script lang="ts">
	import { module } from '@/org.libersoft.dating/scripts/module.ts';
	import { closePage } from '@/org.libersoft.dating/scripts/dating.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';
	import PhotoCard from '@/org.libersoft.dating/components/PhotoCard.svelte';
	const photo = {
		img: 'modules/' + module.identifier + '/img/photos/1.webp',
		name: 'Name',
		description: 'Description',
	};
</script>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="Match game" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/cross.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</Bar>
<Page>
	<PhotoCard {photo} />
</Page>
