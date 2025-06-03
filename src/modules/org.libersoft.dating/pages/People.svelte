<script lang="ts">
	import { hideSidebarMobile } from '@/core/core.js';
	import { page } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
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
		<TopBarTitle text="People nearby" />
	</svelte:fragment>
</TopBar>
<Content>
	{window.innerHeight}<br />
	{window.visualViewport?.height}<br />
	START 1<br />
	START 2<br />
	START 3<br />
	People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />People nearby<br />
	END 1<br />
	END 2<br />
	END 3<br />
</Content>
