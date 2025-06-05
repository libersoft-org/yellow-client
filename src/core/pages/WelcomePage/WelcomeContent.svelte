<script>
	import { hideSidebarMobile, product, link } from '@/core/core.ts';
	import TopBar from '@/core/components/TopBar/TopBar.svelte';
	import TopBarTitle from '@/core/components/TopBar/TopBarTitle.svelte';
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

<TopBar>
	<svelte:fragment slot="left">
		<Icon img="img/back.svg" onClick={back} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<TopBarTitle text="Welcome" />
	</svelte:fragment>
</TopBar>
<div class="welcome">
	<Clickable onClick={clickLogo}>
		<div class="logo">
			<Icon img="img/logo.svg" alt={product} size="200px" />
			<div class="product">{product}</div>
		</div>
	</Clickable>
	<VersionInfo className="centered" />
</div>
