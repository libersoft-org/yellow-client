<script>
	import { product, motto } from '@/core/core.js';
	import Icon from '@/core/components/Icon/Icon.svelte';
</script>

<style>
	.title {
		font-size: 25px;
		font-weight: bold;
		text-align: center;
		margin-bottom: 5px;
	}

	.motto {
		font-size: 13px;
		text-align: center;
	}

	.logo {
		display: flex;
		justify-content: center;
		margin: 20px 0;

		:global(img) {
			animation: bounce 1.5s ease;
			animation-fill-mode: forwards;
		}
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
	}
</style>

<div class="title">Welcome to {product}</div>
<div class="motto">{motto}</div>
<div class="logo">
	<Icon img="img/logo.svg" alt={product} size="100px" padding="0px" />
</div>
<div class="description">This wizard will help you to set up everything you need to get started.</div>
