<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { accounts, findAccount, sendAsync } from '@/core/scripts/core.ts';
	import type { IAccount } from '@/core/scripts/types.ts';
	//let url = 'https://yellow-module1.netlify.app/'
	let url: string = 'http://localhost:5173/';
	let module_id: string = 'org.libersoft.messages2';
	let iframe: HTMLIFrameElement | undefined = $state();

	/* The iframe is sandboxed without allow-same-origin, so its origin is opaque ('null') and it can
	 * never be addressed by an exact targetOrigin. Identity of the sender is therefore established by
	 * comparing event.source against this very iframe's contentWindow - a window reference cannot be
	 * forged or replayed by any other frame. Everything else (schema, command allowlist, account
	 * projection) exists so that even the real iframe cannot drive the session freely. */
	const EXPECTED_ORIGIN = 'null';

	/* Commands the iframe is allowed to issue on behalf of the user. Deliberately narrow: adding an
	 * entry here grants every loaded iframe module that capability, so it needs review, not a wildcard. */
	const ALLOWED_COMMANDS: ReadonlySet<string> = new Set<string>([]);

	const MAX_MESSAGE_TYPE_LENGTH = 64;
	const MAX_COMMAND_LENGTH = 64;

	interface IBridgeRequest {
		type: string;
		requestId: string;
		account?: string;
		command?: string;
		params?: Record<string, unknown>;
	}

	/* Minimal projection of an account. The iframe must never see credentials, session IDs, sockets or
	 * module data. */
	interface IAccountView {
		id: string;
		address: string;
		title?: string;
	}

	function projectAccount(acc: IAccount): IAccountView {
		const view: IAccountView = {
			id: acc.id,
			address: acc.credentials.address,
		};
		const title = acc.settings?.['title'];
		if (typeof title === 'string') view.title = title;
		return view;
	}

	function isPlainObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	/** Reject anything that is not a well-formed bridge request before it reaches any handler. */
	function parseRequest(data: unknown): IBridgeRequest | null {
		if (!isPlainObject(data)) return null;
		const { type, requestId, account, command, params } = data;
		if (typeof type !== 'string' || type.length === 0 || type.length > MAX_MESSAGE_TYPE_LENGTH) return null;
		if (typeof requestId !== 'string' || requestId.length === 0 || requestId.length > 128) return null;
		if (account !== undefined && typeof account !== 'string') return null;
		if (command !== undefined && (typeof command !== 'string' || command.length > MAX_COMMAND_LENGTH)) return null;
		if (params !== undefined && !isPlainObject(params)) return null;
		const request: IBridgeRequest = { type, requestId };
		if (typeof account === 'string') request.account = account;
		if (typeof command === 'string') request.command = command;
		if (isPlainObject(params)) request.params = params;
		return request;
	}

	async function processUserModuleMessage(request: IBridgeRequest): Promise<any> {
		if (request.type === 'server_command') return await serverCommand(request);
		if (request.type === 'list_accounts') {
			const res: IAccountView[] = [];
			for (const account of get(accounts)) {
				const acc = get(account);
				if (acc.available_modules && acc.available_modules[module_id]) res.push(projectAccount(acc));
			}
			return { accounts: res };
		}
		return { error: 'Unsupported message type' };
	}

	async function serverCommand(request: IBridgeRequest): Promise<any> {
		if (!request.command || !ALLOWED_COMMANDS.has(request.command)) return { error: 'Command not allowed' };
		if (!request.account) return { error: 'Account not specified' };
		const account = findAccount(request.account);
		if (!account) return { error: 'Account not found' };
		const acc = get(account);
		return await sendAsync(acc, null, module_id, request.command, request.params ?? {});
	}

	async function onMessage(event: MessageEvent): Promise<void> {
		/* Identity check first: only the window we ourselves created may talk to us. */
		/* Capture the sender window: the identity check below has to compare the very same reference,
		 * and holding it in a local also keeps the narrowing across the await. */
		const source = event.source;
		if (!source || !iframe || source !== iframe.contentWindow) return;
		if (event.origin !== EXPECTED_ORIGIN) return;
		const request = parseRequest(event.data);
		if (!request) return;
		let payload: any;
		try {
			payload = await processUserModuleMessage(request);
		} catch (e) {
			payload = { error: 'Command failed' };
		}
		/* The component may have been destroyed, or the iframe navigated, while the command was in
		 * flight - the reply must still go to the window that asked for it, and only if that window is
		 * still the one we host. */
		if (!iframe || source !== iframe.contentWindow) return;
		/* An opaque origin cannot be named, so '*' is the only possible target here. This is safe only
		 * because the recipient window is the one we hold a reference to. */
		source.postMessage({ requestId: request.requestId, payload }, { targetOrigin: '*' });
	}

	function messageListener(event: MessageEvent): void {
		void onMessage(event);
	}

	onMount(() => {
		window.addEventListener('message', messageListener);
	});

	onDestroy(() => {
		window.removeEventListener('message', messageListener);
	});
</script>

<style>
	.parent {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.parent iframe {
		width: 100%;
		height: 100%;
		border: none;
	}
</style>

<div class="parent">
	<iframe bind:this={iframe} sandbox="allow-scripts" src={url} title="content"></iframe>
</div>
