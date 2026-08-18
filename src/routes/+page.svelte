<script lang="ts">
	import '@/app.css';
	import { onMount, onDestroy, setContext } from 'svelte';
	import { get } from 'svelte/store';
	import { localStorageSharedStore } from '../lib/svelte-shared-store.ts';
	import { init, active_account, accounts_config, setModule, updateLastModuleId } from '../core/scripts/core.ts';
	import { isClientFocused, hideSidebarMobile, selected_corepage_id, selected_module_id, module_decls, product, debug, documentHeight, keyboardHeight, mobileWidth, mobileClass, isMobile, welcomeWizardWindow } from '@/core/scripts/stores.ts';
	import { initBrowserNotifications, initCustomNotifications, handleServiceWorkerNotificationClick, handleServiceWorkerNotificationClose, teardownTauriNotifications } from '@/core/scripts/notifications.ts';
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
	import '@/org.libersoft.messages/scripts/module.ts';
	import '@/org.libersoft.contacts/scripts/module.ts';
	import '@/org.libersoft.wallet/scripts/module';
	import '@/org.libersoft.dating/scripts/module.ts';
	import '@/org.libersoft.iframes/scripts/module.ts';
	import { loadUploadData, makeDownloadChunkAsyncFn } from '@/org.libersoft.messages/scripts/messages.ts';
	import type { IAccount } from '@/core/scripts/types.ts';
	import { setDefaultWindowSize, initWindow } from '../core/scripts/tauri-app.ts';
	import { initZoom } from '@/core/scripts/zoom.ts';
	import { transferScope } from '@/org.libersoft.messages/services/Files/accountScope.ts';
	const wizardData = {
		steps: [
			{ title: 'Welcome', component: WizardWelcomeStep1 },
			{ title: 'Connect your account', component: WizardWelcomeStep2 },
			{ title: 'Notifications', component: WizardWelcomeStep3 },
			{ title: 'All set!', component: WizardWelcomeStep4 },
		],
	};
	const corePages: Record<string, any> = {
		accounts: {
			id: 'accounts',
			sidebar: WelcomeSidebar,
			content: AccountsContent,
		},
	};
	let menus: any[] = [];
	let sidebarSize = localStorageSharedStore<number | undefined>('sidebarSize', undefined);
	let elWindowWelcome: any;
	let isMenuOpen = $state(false);
	let sideBar: HTMLElement;
	let resizer: HTMLElement;
	let isResizingSideBar = false;
	let selectedCorePage = $derived($selected_corepage_id ? corePages[$selected_corepage_id] : undefined);
	let selectedModuleDecl = $derived($selected_module_id !== null ? $module_decls[$selected_module_id] : undefined);
	let contentElement: HTMLElement = undefined as any;
	let initCleanup: (() => void) | null = null;
	let serviceWorkerMessageListener: ((event: MessageEvent) => void) | null = null;
	let pageDestroyed = false;
	/* Every listener registered on window/visualViewport is collected here, so a remount does not
	 * leave a duplicate behind holding a stale closure. */
	let globalListenerCleanups: Array<() => void> = [];

	function addGlobalListener<T extends EventTarget>(target: T | null | undefined, type: string, handler: EventListenerOrEventListenerObject): void {
		if (!target) return;
		target.addEventListener(type, handler);
		globalListenerCleanups.push(() => target.removeEventListener(type, handler));
	}

	setContext('menus', menus);
	setContext('contentElement', contentElement);

	function getFileChunkFactory(uploadId: string, acc: IAccount): (params: any) => Promise<any> {
		const fn = makeDownloadChunkAsyncFn(acc);
		return (params: any): Promise<any> => fn({ uploadId, ...params });
	}

	function getServiceWorkerErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : 'Media request failed';
	}

	function respondToServiceWorker(port: MessagePort, response: any): void {
		try {
			port.postMessage(response);
		} catch (error) {
			console.error('Failed to respond to service worker:', error);
		} finally {
			port.close();
		}
	}

	function isServiceWorkerMediaRequest(data: unknown): data is { type: 'GET_FILE_INFO' | 'GET_CHUNK'; payload: { accId?: unknown; uploadId?: unknown; start?: unknown; end?: unknown } } {
		if (typeof data !== 'object' || data === null) return false;
		const request = data as { type?: unknown; payload?: unknown };
		return (request.type === 'GET_FILE_INFO' || request.type === 'GET_CHUNK') && typeof request.payload === 'object' && request.payload !== null;
	}

	async function handleServiceWorkerMessage(event: MessageEvent): Promise<void> {
		/* Notification events come without a MessagePort - the worker owns the notification, so the
		 * click has to be routed back here to reach the notification's callback. */
		const data = event.data as { type?: unknown; payload?: any } | null;
		if (data && (data.type === 'NOTIFICATION_CLICK' || data.type === 'NOTIFICATION_CLOSE')) {
			const tag = typeof data.payload?.tag === 'string' ? data.payload.tag : '';
			if (!tag) return;
			if (data.type === 'NOTIFICATION_CLICK') await handleServiceWorkerNotificationClick(tag);
			else handleServiceWorkerNotificationClose(tag);
			return;
		}
		const port = event.ports[0];
		if (!port) return;
		if (!isServiceWorkerMediaRequest(event.data)) {
			respondToServiceWorker(port, { error: true, message: 'Invalid media request' });
			return;
		}
		const { payload, type } = event.data;
		const uploadId = typeof payload.uploadId === 'string' ? payload.uploadId : undefined;
		const accId = typeof payload.accId === 'string' ? payload.accId : undefined;
		const acc = get(active_account);
		if (!uploadId || !accId || !acc || acc.id !== accId) {
			respondToServiceWorker(port, { error: true, message: 'Requested media account is unavailable' });
			return;
		}

		try {
			if (type === 'GET_FILE_INFO') {
				/* `acc` was already checked against the requested accId above - use it directly. */
				const upload = await loadUploadData(transferScope(acc, uploadId));
				if (!upload?.record) throw new Error('Media file metadata is unavailable');
				respondToServiceWorker(port, upload.record);
				return;
			}
			const start = payload.start;
			const end = payload.end;
			if (typeof start !== 'number' || typeof end !== 'number' || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start) throw new Error('Invalid media chunk range');
			const getChunk = getFileChunkFactory(uploadId, acc);
			const result = await getChunk({
				offsetBytes: start,
				chunkSize: end - start + 1,
			});
			if (!result?.chunk) throw new Error('Media chunk is unavailable');
			respondToServiceWorker(port, result);
		} catch (error) {
			respondToServiceWorker(port, { error: true, message: getServiceWorkerErrorMessage(error) });
		}
	}

	onMount((async () => {
		//console.log('+page onMount');
		if ('serviceWorker' in window.navigator) {
			try {
				//console.log('+page registering service worker');
				const SW_VERSION = '_version_v2_'; // change this to force update the service worker
				/* Drop our own outdated worker only. Other applications can be served from the same
				 * origin, and unregistering their worker would break them. */
				const ownScriptUrl = new URL('service-worker.js', window.location.href);
				const existing = await navigator.serviceWorker.getRegistrations();
				for (const reg of existing) {
					const active = reg.active;
					if (!active) continue;
					const scriptUrl = new URL(active.scriptURL);
					const isOurs = scriptUrl.origin === ownScriptUrl.origin && scriptUrl.pathname === ownScriptUrl.pathname;
					if (isOurs && !active.scriptURL.includes(SW_VERSION)) {
						await reg.unregister();
						console.log('Unregistered old SW:', active.scriptURL);
					}
				}
				void navigator.serviceWorker
					.register(`service-worker.js?v=${SW_VERSION}`)
					.then((): Promise<ServiceWorkerRegistration> => navigator.serviceWorker.ready)
					.then((registration: ServiceWorkerRegistration): void => {
						if (pageDestroyed) return;
						/*console.log('+page service worker ready');
								console.log('Service worker registration:', registration);
								console.log('Service worker active:', registration.active);
								console.log('Service worker script URL:', registration.active.scriptURL);
								console.log('Service worker state:', registration.active.state);
								console.log('Service worker scope:', registration.scope);**/
						(window as any).sw = registration;
						serviceWorkerMessageListener = (event: MessageEvent): void => {
							void handleServiceWorkerMessage(event);
						};
						navigator.serviceWorker.addEventListener('message', serviceWorkerMessageListener);
					})
					.catch((error: unknown): void => {
						console.error('Failed to register service worker:', error);
					});
			} catch (error) {
				console.error('Failed to register service worker:', error);
			}
		} else console.log('+page This browser does not support service workers.');
		initZoom();
		setDefaultWindowSize();
		createTrayIcon();
		initBrowserNotifications();
		initCustomNotifications();
		initWindow();
		initBrowserThemeDetection();
		if ($sidebarSize) setSidebarSize($sidebarSize);
		addGlobalListener(window, 'focus', () => isClientFocused.set(true));
		addGlobalListener(window, 'blur', () => isClientFocused.set(false));
		//window.addEventListener('keydown', onkeydown);
		(window as any)?.chrome?.webview?.postMessage('Testing message from JavaScript to native notification');
		if ($accounts_config.length === 0) elWindowWelcome?.open();
		welcomeWizardWindow.set(elWindowWelcome);
		setupIframeListener();
		// TODO: I don't know what this is, test out
		//document.body.style.touchAction = 'none';
		//document.documentElement.style.touchAction = 'none';
		const visualViewport = window.visualViewport;
		if (visualViewport) {
			addGlobalListener(visualViewport, 'resize', updateAppHeight);
			addGlobalListener(visualViewport, 'scroll', updateAppHeight); // is this necessary?
		} else addGlobalListener(window, 'resize', updateAppHeight);
		addGlobalListener(window, 'resize', onZoomResize);
		updateAppHeight();
		initCleanup = await init();
	}) as any);

	onDestroy(async () => {
		console.log('+page onDestroy');
		pageDestroyed = true;
		if (serviceWorkerMessageListener && 'serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', serviceWorkerMessageListener);
		for (const cleanup of globalListenerCleanups) cleanup();
		globalListenerCleanups = [];
		/* Releases the process-wide Tauri notification action listener. */
		teardownTauriNotifications();
		unsubscribeIsMobile();
		/* A destroy in the middle of a sidebar drag would otherwise leave these behind. */
		stopResizeSideBar();
		initCleanup?.();
		await destroyTrayIcon();
	});

	// Capture initial height when keyboard is closed
	let initialViewportHeight = window.innerHeight;

	function updateAppHeight(): void {
		//console.log('updateAppHeight');
		const visualViewport = window.visualViewport;
		let viewportHeight;
		if (visualViewport) {
			viewportHeight = visualViewport.height;

			// Simple and reliable keyboard height detection
			let keyboardHeightValue = initialViewportHeight - visualViewport.height;

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
	const onZoomResize = (): boolean => {
		var newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
		if (newPx_ratio != px_ratio) {
			px_ratio = newPx_ratio;
			//console.log('zooming: ', px_ratio);
			return true;
		} else {
			//console.log('just resizing, px_ratio: ', px_ratio);
			return false;
		}
	};

	function setupIframeListener(): void {
		// window.addEventListener('message', event => {
		//  console.log('event.data: ', event.data);
		// });
	}

	function onSelectModule(id): void {
		//console.log('onSelectModule: ' + id);
		setModule(id);
	}

	function onCloseModule(): void {
		setModule(null);
		updateLastModuleId(null);
	}

	function startResizeSideBar(): void {
		console.log('startResizeSideBar');
		isResizingSideBar = true;
		document.body.style.userSelect = 'none';
		document.body.style.webkitUserSelect = 'none'; // Safari specific
		window.addEventListener('mousemove', resizeSideBar);
		window.addEventListener('mouseup', stopResizeSideBar);
	}

	function stopResizeSideBar(): void {
		isResizingSideBar = false;
		document.body.style.userSelect = '';
		document.body.style.webkitUserSelect = ''; // Restore Safari-specific selection
		window.removeEventListener('mousemove', resizeSideBar);
		window.removeEventListener('mouseup', stopResizeSideBar);
		setSidebarSize(sideBar.clientWidth);
		sidebarSize.set(sideBar.clientWidth);
	}

	function resizeSideBar(e): void {
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

	let sidebarWidth = $state<string | undefined>();

	function setSidebarSize(width): void {
		const max = 500;
		const min = 200;
		let sideBarWidth = Math.min(Math.max(width, min), max);
		sideBar.style.minWidth = sideBarWidth + 'px';
		sideBar.style.maxWidth = sideBarWidth + 'px';
		resizer.style.left = sideBarWidth + 'px';
	}

	/* Kept with the other cleanups: this subscription outlived the component otherwise. */
	const unsubscribeIsMobile = isMobile.subscribe(v => {
		//console.log('isMobile: ', v);
		if (v) sidebarWidth = '';
		else sidebarWidth = ($sidebarSize || 300) + 'px';
	});

	function onkeydown(event): void {
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
			{@const Sidebar = selectedCorePage.sidebar}
			<Sidebar />
		{:else if selectedModuleDecl?.panels?.sidebar}
			{@const Sidebar = selectedModuleDecl.panels.sidebar}
			<Sidebar />
		{:else}
			<WelcomeSidebar />
		{/if}
	</div>
	<div class="resizer" style:left={sidebarWidth} role="none" bind:this={resizer} onmousedown={startResizeSideBar}></div>
	<div class="content" bind:this={contentElement}>
		{#if selectedCorePage}
			{@const Content = selectedCorePage.content}
			<Content />
		{:else if selectedModuleDecl?.panels?.content}
			{@const Content = selectedModuleDecl.panels.content}
			<Content />
		{:else}
			<WelcomeContent />
		{/if}
	</div>
</div>
<Menu bind:showMenu={isMenuOpen} />
<Window body={Wizard} bind:this={elWindowWelcome} params={wizardData} testId="welcome-wizard" />
