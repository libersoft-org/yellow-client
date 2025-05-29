<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '@/core/components/Button/Button.svelte';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'core/theme/Button',
		component: Button,
		tags: ['autodocs'],
		args: {
			text: 'Button',
		},
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" />

<Story
	name="Icon"
	args={{
		img: 'img/back.svg',
	}}
/>

<Story
	name="Disabled"
	args={{
		enabled: false,
	}}
/>

<Story
	name="Width100px"
	args={{
		width: '100px',
	}}
/>
