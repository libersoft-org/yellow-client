<script>
	import { hideSidebarMobile, product, link } from '@/core/core.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Clickable from '@/core/components/Clickable/Clickable.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import VersionInfo from '@/core/components/VersionInfo/VersionInfo.svelte';

	function clickLogo() {
		window.open(link, '_blank');
	}

	function back() {
		hideSidebarMobile.set(false);
	}
</script>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5px;
		height: 100vh;
		background: var(--background-image) 0 0 / 400px repeat;
		color: var(--primary-foreground);
	}

	.welcome .logo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}

	.welcome .logo .product {
		font-size: 40px;
		font-weight: bold;
	}
</style>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="Welcome" />
	{/snippet}
</Bar>
<div class="welcome">
	<Clickable onClick={clickLogo}>
		<div class="logo">
			<Icon img="img/logo.svg" alt={product} size="200px" />
			<div class="product">{product}</div>
		</div>
	</Clickable>
	<VersionInfo className="centered" />
</div>
