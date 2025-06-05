<script lang="ts">
	import { closePage } from '../dating.js';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Content from '../components/Content.svelte';
</script>

<TopBar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="People nearby" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/close.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
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
