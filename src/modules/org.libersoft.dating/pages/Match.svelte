<script lang="ts">
	import { module } from '../module.js';
	import { closePage } from '../dating.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Content from '../components/Content.svelte';
	import PhotoCard from '../components/PhotoCard.svelte';
	const photo = {
		img: 'modules/' + module.identifier + '/img/photos/1.webp',
		name: 'Name',
		description: 'Description',
	};
</script>

<TopBar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Match game" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/close.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</TopBar>
<Content>
	<PhotoCard {photo} />
</Content>
