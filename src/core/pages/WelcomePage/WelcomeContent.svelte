<script>
	import BaseButton from '../../components/Button/BaseButton.svelte';
	import Icon from '../../components/Icon/Icon.svelte';
	import VersionInfo from '../../components/VersionInfo/VersionInfo.svelte';
	import { product, link } from '../../core.js';

	function clickLogo() {
		window.open(link, '_blank');
	}
</script>

<div class="welcome">
	<BaseButton onClick={clickLogo}>
		<div class="logo">
			<Icon img="img/logo.svg" alt={product} size="200px" />
			<div class="product">{product}</div>
		</div>
	</BaseButton>
	<VersionInfo className="centered" />
</div>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5px;
		height: 100vh;
		background: url('/img/background.webp') repeat;
		background-size: 400px;
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
