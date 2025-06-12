<script lang="ts">
	interface Props {
		text?: string;
		colorVariable?: string;
	}
	let { text, colorVariable = '--secondary-foreground' }: Props = $props();
</script>

<style>
	.content-bar-title {
		font-size: 22px;
		font-weight: bold;
	}
</style>

<div class="content-bar-title" style:color="var({colorVariable})">{text}</div>
