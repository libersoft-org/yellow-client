<script lang="ts">
	import { closePage } from '../scripts/dating.ts';
	import Bar from '@/core/components/Content/ContentBar.svelte';
	import BarTitle from '@/core/components/Content/ContentBarTitle.svelte';
	import Icon from '@/core/components/Icon/Icon.svelte';
	import Page from '@/core/components/Content/ContentPage.svelte';

	// Sample users data
	const users = [
		{
			id: 1,
			name: 'Name 1',
			age: 25,
			gender: 'female',
			photo: '/modules/org.libersoft.dating/img/photos/1.webp',
			distance: '2.5 km away',
		},
		{
			id: 2,
			name: 'Name 2',
			age: 28,
			gender: 'male',
			photo: '/modules/org.libersoft.dating/img/photos/2.webp',
			distance: '1.8 km away',
		},
		{
			id: 3,
			name: 'Name 3',
			age: 24,
			gender: 'female',
			photo: '/modules/org.libersoft.dating/img/photos/3.webp',
			distance: '3.2 km away',
		},
	];
</script>

<style>
	.people-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: stretch;
	}

	.user-card {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1 1 250px;
		min-width: 250px;
		max-width: 350px;
		aspect-ratio: 3/4;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		cursor: pointer;
	}

	.user-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
	}

	.user-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8));
		color: white;
		padding: 40px 0 0;
		box-sizing: border-box;
	}

	.user-info {
		background: rgba(0, 0, 0, 0.5);
		padding: 16px;
		margin: 0;
	}

	.user-name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 0 4px 0;
	}

	.name-and-gender {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 20px;
		font-weight: 600;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.user-age {
		font-size: 20px;
		font-weight: 600;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	.gender-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.gender-dot.female {
		background-color: #f44;
	}

	.gender-dot.male {
		background-color: #44f;
	}

	.user-distance {
		font-size: 14px;
		margin: 0;
		opacity: 0.95;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	}

	@media (max-width: 768px) {
		.people-container {
			padding: 12px;
			gap: 16px;
		}

		.user-name {
			font-size: 18px;
		}

		.user-info {
			padding: 10px 12px;
		}
	}

	@media (max-width: 480px) {
		.people-container {
			padding: 8px;
			gap: 12px;
		}

		.user-info {
			padding: 8px 10px;
		}
	}
</style>

<Bar>
	{#snippet left()}
		<Icon img="img/back.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnDesktop={false} />
		<BarTitle text="People nearby" />
	{/snippet}
	{#snippet right()}
		<Icon img="img/cross.svg" onClick={closePage} colorVariable="--secondary-foreground" visibleOnMobile={false} />
	{/snippet}
</Bar>
<Page>
	<div class="people-container">
		{#each users as user (user.id)}
			<div class="user-card">
				<img src={user.photo} alt={user.name} />
				<div class="overlay">
					<div class="user-info">
						<div class="user-name-row">
							<div class="name-and-gender">
								<span class="gender-dot {user.gender}"></span>
								{user.name}
							</div>
							<div class="user-age">{user.age}</div>
						</div>
						<div class="user-distance">{user.distance}</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</Page>
