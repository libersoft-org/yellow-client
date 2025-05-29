<script lang="ts">
	import { module } from '../module.js';
	import Content from '../components/content.svelte';
	import PhotoCard from '../components/photo-card.svelte';
	import { page } from '../dating.js';
	import core, { isMobile } from '@/core/core.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';

	const photo = {
		img: 'modules/' + module.identifier + '/img/photos/1.webp',
		name: 'Name',
		description: 'Description',
	};

	function modulePageClose() {
		page.set('');
		core.hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		{#if $isMobile}
			<Icon img="img/back.svg" onClick={() => modulePageClose()} colorVariable="--icon-white" visibleOnDesktop={true} />
		{/if}
		<h1 class="title">Match game</h1>
	</svelte:fragment>
</TopBar>

<Content>
	<PhotoCard {photo} />
</Content>
