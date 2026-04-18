<script lang="ts">
	import Icon from '@/core/components/Icon/Icon.svelte';
	import { module } from '@/org.libersoft.wallet/scripts/module';
</script>

<style>
	.title {
		font-size: 25px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 5px;
	}

	.subtitle {
		font-size: 13px;
		text-align: center;
		color: var(--secondary-foreground);
	}

	.logo {
		display: flex;
		justify-content: center;
		margin: 20px 0;
	}

	.logo :global(img) {
		animation: bounce 1.5s ease;
		animation-fill-mode: forwards;
	}

	@keyframes bounce {
		0% {
			transform: scale(0.5);
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	.description {
		text-align: center;
		line-height: 1.5;
	}
</style>

<div class="title">Welcome to {module.name}</div>
<div class="subtitle">Secure cryptocurrency management</div>
<div class="logo">
	<Icon img="modules/{module.identifier}/img/wallet.svg" alt={module.name} size="100px" padding="0px" />
</div>
<div class="description">This wizard will help you set up your wallet, add networks, and configure your first wallet for secure cryptocurrency transactions.</div>
