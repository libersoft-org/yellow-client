<script lang="ts">
	interface Props {
		text?: string;
		colorVariable?: string;
	}
	let { text, colorVariable = '--secondary-foreground' }: Props = $props();
</script>

<style>
	.title {
		font-size: 22px;
		font-weight: bold;
		color: var(--secondary-foreground);
	}
</style>

<div class="title" style:color="var({colorVariable})">{text}</div>
