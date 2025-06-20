<script lang="ts">
	import Button from '@/core/components/Button/Button.svelte';
	import { getContext, setContext, type Component } from 'svelte';
	interface Props {
		close?: () => void;
		params: {
			steps: Array<{
				title: string;
				component: Component;
			}>;
		};
	}
	let { close, params }: Props = $props();
	let nextText = $state('Next');
	const steps = $derived(params.steps);
	let currentStep = $state(0);
	const ContentComponent = $derived(steps[currentStep].component);
	let setTitle = getContext('setTitle') as (title: string) => Promise<void>;
	let pageChanged = getContext('pageChanged') as () => Promise<void>;

	function setNextText(text: string) {
		nextText = text;
	}

	setContext('wizard', { setNextText });

	$effect(() => {
		if (steps[currentStep].title) {
			setTitle(steps[currentStep].title);
		}
	});

	async function nextStep() {
		if (currentStep < steps.length - 1) currentStep += 1;
		if (pageChanged) await pageChanged();
	}

	async function prevStep() {
		if (currentStep > 0) currentStep -= 1;
		if (pageChanged) await pageChanged();
	}
</script>

<style>
	.wizard {
		display: flex;
		flex-direction: column;
		gap: 10px;
		max-width: 100vw;
		max-height: 100vh;
	}

	.progress-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
	}

	.progress-bar .step {
		display: flex;
		align-items: center;
	}

	.progress-bar .step .circle {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid var(--secondary-harder-background);
		background-color: var(--secondary-softer-background);
		color: var(--secondary-foreground);
		text-align: center;
		line-height: 30px;
		position: relative;
	}

	.progress-bar .step .circle.active {
		border: 1px solid var(--primary-harder-background);
		background-color: var(--primary-background);
		color: var(--primary-foreground);
	}

	.progress-bar .step .line {
		width: 50px;
		height: 2px;
		background-color: var(--secondary-softer-background);
	}

	.navigation {
		display: flex;
		gap: 10px;
	}

	.navigation .gap {
		flex-grow: 1;
	}
</style>

<div class="wizard">
	<div class="progress-bar">
		{#each steps as _, index}
			<div class="step">
				<div class="circle {index === currentStep ? 'active' : ''}">
					{index + 1}
				</div>
				{#if index < steps.length - 1}
					<div class="line"></div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="content">
		<ContentComponent {params} />
	</div>
	<div class="navigation">
		{#if currentStep > 0}
			<Button img="img/caret-left.svg" text="Previous" onClick={prevStep} />
		{/if}
		<div class="gap"></div>
		{#if currentStep < steps.length - 1}
			<Button data-testid="wizard-next" img="img/caret-right.svg" text={nextText} right onClick={nextStep} />
		{:else}
			<Button data-testid="wizard-next" img="img/caret-right.svg" text="Finish" right onClick={close} />
		{/if}
	</div>
</div>
