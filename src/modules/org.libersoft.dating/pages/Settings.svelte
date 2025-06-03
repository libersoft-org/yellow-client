<script lang="ts">
	import { hideSidebarMobile } from '@/core/core.js';
	import { page } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';

	function modulePageClose() {
		page.set('');
		hideSidebarMobile.set(false);
	}
</script>

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={modulePageClose} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Settings" />
	</svelte:fragment>
</TopBar>
<Content>Settings</Content>
