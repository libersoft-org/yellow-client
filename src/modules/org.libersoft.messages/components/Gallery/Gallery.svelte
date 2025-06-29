<script lang="ts">
	import { identifier } from '../../messages.js';
	import Button from '@/core/components/Button/Button.svelte';
	import { assembleFile } from '@/org.libersoft.messages/services/Files/utils.ts';
	import Spinner from '@/core/components/Spinner/Spinner.svelte';
	import galleryStore from '../../stores/GalleryStore.ts';
	import Icon from '@/core/components/Icon/Icon.svelte';
	let gallery = galleryStore.store;
	let currentFile = galleryStore.currentFile();
	let currentFilePosition = $derived($gallery.files.indexOf($currentFile) + 1);

	function download() {
		assembleFile($currentFile.url, $currentFile.fileName);
	}

	function close() {
		galleryStore.setShow(false);
	}

	function previous() {
		galleryStore.previous();
	}

	function next() {
		galleryStore.next();
	}

	let canPrevious = galleryStore.canPrevious();
	let canNext = galleryStore.canNext();

	let loading = $state(false);

	function handleKeyboard(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowLeft' && $canPrevious) {
			previous();
		} else if (event.key === 'ArrowRight' && $canNext) {
			next();
		}
	}

	$effect(() => {
		if ($currentFile && !$currentFile.loaded) {
			loading = true;
			$currentFile
				.loadFile()
				.then(loadedFile => {
					galleryStore.updateFile($currentFile.id, {
						loaded: true,
						...loadedFile,
					});
				})
				.catch(err => {
					console.error('error fetching image data for yellow id:', $currentFile.id, err);
				})
				.finally(() => {
					loading = false;
				});
		}
	});

	$effect(() => {
		const opts = { capture: true };
		if ($gallery.show) document.addEventListener('keydown', handleKeyboard, opts);
		else document.removeEventListener('keydown', handleKeyboard, opts);
	});

	function onAnywhereClick(event) {
		// very simple background close
		if (event.target === event.currentTarget) {
			close();
		}
	}
</script>

<style>
	.gallery {
		z-index: 150;
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--secondary-background);
	}

	.side-control {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0;
		width: 80px;
		height: 100%;
		background-color: var(--secondary-hard-background);
	}

	.side-control:hover {
		background-color: var(--secondary-soft-background);
	}

	.side-prev {
		left: 0;
	}

	.side-next {
		right: 0;
	}

	.top-left {
		left: 0;
	}

	.top-right {
		right: 0;
	}

	.top-left,
	.top-right {
		z-index: 151;
		position: absolute;
		padding: 10px;
		top: 0;
	}

	.image {
		position: relative;
		display: flex;
		overflow: hidden;
		flex-flow: column;
		justify-content: center;
		max-width: calc(100% - 160px);
	}

	.image .caption {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 10px;
		color: var(--secondary-foreground);
	}

	.image img {
		max-width: 100%;
		max-height: 85vh;
		border-radius: 10px;
	}
</style>

{#if $gallery.show}
	<div class="gallery" onpointerdown={onAnywhereClick}>
		<div class="top-left">
			<Button img="img/download.svg" onClick={download} />
		</div>
		<div class="top-right">
			<Button img="img/cross.svg" onClick={close} />
		</div>
		<div class="side-control side-prev" style:display={$canPrevious ? undefined : 'none'}>
			<Icon img="img/caret-left.svg" alt="Previous" colorVariable="--secondary-foreground" size="80px" onClick={previous} />
		</div>
		{#key $currentFile.id}
			{#if $currentFile}
				<div class="image">
					<div class="caption">
						{$currentFile.fileName}
					</div>
					{#if !loading}
						<img src={$currentFile.url} alt={$currentFile.fileName} />
					{:else}
						<div>
							<Spinner />
						</div>
					{/if}
					<div class="caption">
						{currentFilePosition} of {$gallery.files.length}
					</div>
				</div>
			{/if}
		{/key}

		<div class="side-control side-next" style:display={$canNext ? undefined : 'none'}>
			<Icon img="img/caret-right.svg" alt="Next" colorVariable="--secondary-foreground" size="80px" onClick={next} />
		</div>
	</div>
{/if}
