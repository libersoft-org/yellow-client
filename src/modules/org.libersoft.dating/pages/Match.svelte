<script lang="ts">
	import { hideSidebarMobile } from '@/core/core.js';
	import { module } from '../module.js';
	import { page } from '../dating.js';
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

	function modulePageClose() {
		page.set('');
		hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={modulePageClose} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Match game" />
	</svelte:fragment>
</TopBar>
<Content>
	<PhotoCard {photo} />
</Content>
