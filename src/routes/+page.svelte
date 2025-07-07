<script>
	import '@/app.css';
	import { onMount, onDestroy, setContext } from 'svelte';
	import { get } from 'svelte/store';
	import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
	import { init, active_account, accounts_config, setModule } from '../core/scripts/core.ts';
	import { isClientFocused, hideSidebarMobile, selected_corepage_id, selected_module_id, module_decls, product, debug, documentHeight, keyboardHeight, mobileWidth, mobileClass, isMobile } from '@/core/scripts/stores.ts';
	import { initBrowserNotifications, initCustomNotifications } from '@/core/scripts/notifications.ts';
	import { selected_theme_index, initBrowserThemeDetection } from '@/core/scripts/themes.ts';
	import Menu from '@/core/components/Menu/Menu.svelte';
	import MenuBar from '@/core/components/Menu/MenuBar.svelte';
	import ModuleBar from '@/core/components/ModuleBar/ModuleBar.svelte';
	import AccountBar from '@/core/components/Account/AccountBar.svelte';
	import WelcomeSidebar from '@/core/pages/Welcome/Sidebar.svelte';
	import WelcomeContent from '@/core/pages/Welcome/Content.svelte';
	import AccountsContent from '@/core/pages/AccountsPage/AccountsContent.svelte';
	import Window from '@/core/components/Window/Window.svelte';
	import Wizard from '@/core/components/Wizard/Wizard.svelte';
	import WizardWelcomeStep1 from '@/core/wizard/WelcomeStep1.svelte';
	import WizardWelcomeStep2 from '@/core/wizard/WelcomeStep2.svelte';
	import WizardWelcomeStep3 from '@/core/wizard/WelcomeStep3.svelte';
	import WizardWelcomeStep4 from '@/core/wizard/WelcomeStep4.svelte';
	import { createTrayIcon, destroyTrayIcon } from '@/core/scripts/tray_icon.ts';
	import '../modules/org.libersoft.messages/scripts/module.ts';
	import '../modules/org.libersoft.contacts/scripts/module.ts';
	import '../modules/org.libersoft.wallet/scripts/module.ts';
	import '../modules/org.libersoft.dating/scripts/module.ts';
	import '../modules/org.libersoft.iframes/scripts/module.ts';
	import { loadUploadData, makeDownloadChunkAsyncFn } from '@/org.libersoft.messages/scripts/messages.js';
	import { setDefaultWindowSize, initWindow } from '../core/scripts/tauri-app.ts';
	import { initZoom } from '@/core/scripts/zoom.ts';
	const wizardData = {
		steps: [
			{ title: 'Welcome', component: WizardWelcomeStep1 },
			{ title: 'Connect your account', component: WizardWelcomeStep2 },
			{ title: 'Notifications', component: WizardWelcomeStep3 },
			{ title: 'All set!', component: WizardWelcomeStep4 },
		],
	};
	const corePages = {
		accounts: {
			id: 'accounts',
			sidebar: WelcomeSidebar,
			content: AccountsContent,
		},
	};
	let menus = [];
	let sidebarSize = localStorageSharedStore('sidebarSize', undefined);
	let elWindowWelcome;
	let content;
	let isMenuOpen = false;
	let sideBar;
	let resizer;
	let isResizingSideBar = false;
	let selectedCorePage;
	let selectedModuleDecl;
	let contentElement;

	setContext('menus', menus);
	setContext('contentElement', contentElement);

	$: selectedCorePage = corePages[$selected_corepage_id];
	//$: console.log('selectedCorePage: ', selectedCorePage);
	$: selectedModuleDecl = $module_decls[$selected_module_id];
	//$: console.log('selectedModuleDecl: ', selectedModuleDecl);

	function getFileChunkFactory(uploadId) {
		const fn = makeDownloadChunkAsyncFn(get(active_account));
		return params => fn({ uploadId, ...params });
	}

	onMount(async () => {
		//console.log('+page onMount');
		if ('serviceWorker' in window.navigator) {
			//console.log('+page registering service worker');
			const SW_VERSION = '_version_v1_'; // change this to force update the service worker
			// TODO: rm after testing and dev
			const existing = await navigator.serviceWorker.getRegistrations();
			for (const reg of existing) {
				if (reg.active && !reg.active.scriptURL.includes(SW_VERSION)) {
					await reg.unregister();
					console.log('Unregistered old SW:', reg.active.scriptURL);
				}
			}
			navigator.serviceWorker.register(`service-worker.js?v=${SW_VERSION}`);
			navigator.serviceWorker.ready.then(registration => {
				/*console.log('+page service worker ready');
				console.log('Service worker registration:', registration);
				console.log('Service worker active:', registration.active);
				console.log('Service worker script URL:', registration.active.scriptURL);
				console.log('Service worker state:', registration.active.state);
				console.log('Service worker scope:', registration.scope);**/
				window.sw = registration;
				navigator.serviceWorker.addEventListener('message', e => {
					if (e.data.type === 'GET_FILE_INFO') {
						const { accId, uploadId } = e.data.payload;
						loadUploadData(uploadId).then(uploadData => {
							e.ports[0].postMessage(uploadData.record);
						});
					}
					if (e.data.type === 'GET_CHUNK') {
						const { accId, uploadId, start, end } = e.data.payload;
						const getChunk = getFileChunkFactory(uploadId);
						getChunk({
							offsetBytes: start,
							chunkSize: end + 1 - start,
						}).then(data => {
							e.ports[0].postMessage(data);
						});
					}
				});
			});
		} else {
			console.log('+page This browser does not support service workers.');
		}

		initZoom();
		setDefaultWindowSize();
		createTrayIcon();
		initBrowserNotifications();
		initCustomNotifications();
		initWindow();
		initBrowserThemeDetection();
		if ($sidebarSize) setSidebarSize($sidebarSize);
		window.addEventListener('focus', () => isClientFocused.set(true));
		window.addEventListener('blur', () => isClientFocused.set(false));
		//window.addEventListener('keydown', onkeydown);
		window?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
		if ($accounts_config.length === 0) elWindowWelcome?.open();
		setupIframeListener();
		// TODO: I don't know what this is, test out
		//document.body.style.touchAction = 'none';
		//document.documentElement.style.touchAction = 'none';
		const visualViewport = window.visualViewport;
		if (visualViewport) {
			visualViewport.addEventListener('resize', updateAppHeight);
			visualViewport.addEventListener('scroll', updateAppHeight); // is this necessary?
		} else window.addEventListener('resize', updateAppHeight);
		updateAppHeight();
		return init();
	});

	onDestroy(async () => {
		console.log('+page onDestroy');
		await destroyTrayIcon();
	});

	function updateAppHeight() {
		//console.log('updateAppHeight');
		if ('virtualKeyboard' in navigator) {
			navigator.virtualKeyboard.addEventListener('geometrychange', event => {
				//console.log('virtualKeyboard geometrychange:', event.target.boundingRect);
			});
		}
		const visualViewport = window.visualViewport;
		let viewportHeight;
		if (visualViewport) {
			viewportHeight = visualViewport.height;
			let clientHeight = visualViewport.clientHeight;
			//console.log('clientHeight:', clientHeight);
			let keyboardHeightValue = viewportHeight - clientHeight;
			//console.log('keyboardHeightValue:', keyboardHeightValue);
			if (keyboardHeightValue < 0) keyboardHeightValue = 0;
			keyboardHeight.set(keyboardHeightValue);
		} else viewportHeight = window.innerHeight;
		document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
		const metaViewport = document.querySelector('meta[name="viewport"]');
		if (metaViewport) metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content');
		documentHeight.set(document.documentElement.clientHeight);
		isMobile.set(window.matchMedia('(max-width: ' + $mobileWidth + ')').matches);
		//console.log('window.innerHeight:', window.innerHeight);
		//console.log('viewportHeight:', viewportHeight);
		//console.log('document.documentElement.clientHeight:', document.documentElement.clientHeight);
	}
	let px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
	window.addEventListener('resize', () => {
		var newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
		if (newPx_ratio != px_ratio) {
			px_ratio = newPx_ratio;
			//console.log('zooming: ', px_ratio);
			return true;
		} else {
			//console.log('just resizing, px_ratio: ', px_ratio);
			return false;
		}
	});

	function setupIframeListener() {
		// window.addEventListener('message', event => {
		//  console.log('event.data: ', event.data);
		// });
	}

	function updateLastModuleId(id) {
		//console.log('updateLastModuleId: ' + id);
		if (!$active_account) return;
		accounts_config.update(accounts => {
			accounts.forEach(account => {
				if (account.id === $active_account.id) {
					account.settings = account.settings ? account.settings : {};
					account.settings.last_module_id = id;
				}
			});
			return accounts;
		});
	}

	function onSelectModule(id) {
		//console.log('onSelectModule: ' + id);
		setModule(id);
		updateLastModuleId(id);
	}

	function onCloseModule() {
		setModule(null);
		updateLastModuleId(null);
	}

	function startResizeSideBar() {
		console.log('startResizeSideBar');
		isResizingSideBar = true;
		document.body.style.userSelect = 'none';
		document.body.style.webkitUserSelect = 'none'; // Safari specific
		window.addEventListener('mousemove', resizeSideBar);
		window.addEventListener('mouseup', stopResizeSideBar);
	}

	function stopResizeSideBar() {
		isResizingSideBar = false;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = ''; // Restore Safari-specific selection
		window.removeEventListener('mousemove', resizeSideBar);
		window.removeEventListener('mouseup', stopResizeSideBar);
		setSidebarSize(sideBar.clientWidth);
		sidebarSize.set(sideBar.clientWidth);
	}

	function resizeSideBar(e) {
		// const moduleBarItems = e.target.querySelector('.module-bar > .items');
		// if (moduleBarItems) {
		// 	moduleBarItems.style.height = 'auto';
		// }
		if (isResizingSideBar) {
			e.preventDefault();
			// delta from mouse move
			let delta = e.clientX - sideBar.clientWidth;
			setSidebarSize(sideBar.clientWidth + delta);
		}
	}

	let sidebarWidth;

	function setSidebarSize(width) {
		const max = 500;
		const min = 200;
		let sideBarWidth = Math.min(Math.max(width, min), max);
		sideBar.style.minWidth = sideBarWidth + 'px';
		sideBar.style.maxWidth = sideBarWidth + 'px';
		resizer.style.left = sideBarWidth + 'px';
	}

	isMobile.subscribe(v => {
		//console.log('isMobile: ', v);
		if (v) sidebarWidth = '';
		else sidebarWidth = ($sidebarSize || 300) + 'px';
	});

	function onkeydown(event) {
		//console.log('window onkeydown: ', event);
		if (event.ctrlKey && (event.key === '`' || event.key === '~' || event.key === ';')) debug.update(d => !d);
		// Handle Ctrl + 0 to toggle between theme index 0 and 1
		if (event.ctrlKey && event.key === '0') selected_theme_index.update(current => (current === 0 ? 1 : 0));
	}
</script>

<style>
	.app {
		display: flex;
		width: 100vw;
		max-width: 100vw;
		height: var(--app-height, 100vh);
		max-height: var(--app-height, 100vh);
		overflow: hidden;
	}

	.sidebar {
		z-index: 5;
		display: flex;
		flex-direction: column;
		position: relative;
		max-height: 100%;
		box-shadow: var(--shadow);
		background-color: var(--secondary-background);
		color: var(--secondary-foreground);
	}

	.sidebar.mobile {
		position: absolute;
		min-width: 100%;
		max-width: 100%;
		height: 100%;
	}

	.sidebar.hidden-on-mobile {
		display: none;
	}

	.resizer {
		z-index: 6;
		position: absolute;
		top: 0;
		bottom: 0;
		width: 5px;
		cursor: ew-resize;
	}

	.resizer.mobile {
		display: none;
	}

	.content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		container-type: inline-size;
	}
</style>

<svelte:window {onkeydown} />
<svelte:head>
	<title>{product}</title>
</svelte:head>
<div class="app" style:--sidebar-width={sidebarWidth}>
	<div class="sidebar {$mobileClass} {$hideSidebarMobile && $isMobile ? 'hidden-on-mobile' : ''}" style:min-width={sidebarWidth} style:max-width={sidebarWidth} style:width={sidebarWidth} bind:this={sideBar}>
		<MenuBar onOpenMenu={() => (isMenuOpen = true)} />
		<AccountBar />
		<ModuleBar {onSelectModule} {onCloseModule} />
		{#if selectedCorePage}
			<svelte:component this={selectedCorePage.sidebar} />
		{:else if selectedModuleDecl}
			<svelte:component this={selectedModuleDecl.panels.sidebar} />
		{:else}
			<WelcomeSidebar />
		{/if}
	</div>
	<div class="resizer" style:left={sidebarWidth} role="none" bind:this={resizer} on:mousedown={startResizeSideBar}></div>
	<div class="content" bind:this={contentElement}>
		{#if selectedCorePage}
			<svelte:component this={selectedCorePage.content} />
		{:else if selectedModuleDecl}
			<svelte:component this={selectedModuleDecl.panels.content} bind:this={content} />
		{:else}
			<WelcomeContent />
		{/if}
	</div>
</div>
<Menu bind:showMenu={isMenuOpen} />
<Window body={Wizard} bind:this={elWindowWelcome} params={wizardData} testId="welcome-wizard" />
