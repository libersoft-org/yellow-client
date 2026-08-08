<script lang="ts">
	import MessageContentRenderer from '@/org.libersoft.messages/components/MessageContent/MessageContentRenderer.svelte';
	import Dialog from '@/core/components/Dialog/Dialog.svelte';

	/* A link in a message is written entirely by the sender - both where it points and what it says.
	 * Nothing in sanitizing can catch <a href="https://evil.test">https://yellow.libersoft.org</a>,
	 * because both halves are legitimate on their own. So the destination is never taken on trust:
	 * the real host is always visible, and a link whose text impersonates a different address has to
	 * be confirmed before it opens. */
	let { href = '', node, children = [] } = $props();

	/* Schemes a message is allowed to link to. DOMPurify already rejects javascript: and friends;
	 * this is the second gate, and it is what decides whether we open the URL ourselves. */
	const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', 'ftp:', 'ftps:', 'bitcoin:', 'ethereum:']);

	function parseUrl(value: string): URL | null {
		try {
			return new URL(value, typeof window !== 'undefined' ? window.location.href : 'https://localhost/');
		} catch {
			return null;
		}
	}

	let target = $derived(parseUrl(href));
	let isSafeProtocol = $derived(!!target && ALLOWED_PROTOCOLS.has(target.protocol));
	/* mailto:/tel:/bitcoin: have no host - there is no domain to disclose or to spoof. */
	let targetHost = $derived(target && target.host ? target.host : null);
	let isExternal = $derived(!!targetHost && (typeof window === 'undefined' || targetHost !== window.location.host));

	let linkText = $derived((node?.textContent ?? '').trim());

	/** Host the link text claims to lead to, if the text is written like an address at all. */
	function claimedHost(text: string): string | null {
		if (!text) return null;
		const candidate = /^(?:[a-z][a-z0-9+.-]*:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:[:/?#]|$)/i.exec(text);
		if (!candidate) return null;
		const parsed = parseUrl(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
		return parsed?.host ?? null;
	}

	function sameSite(a: string, b: string): boolean {
		if (a === b) return true;
		/* www.example.com and example.com are the same destination to a reader. */
		const strip = (host: string): string => host.replace(/^www\./i, '');
		return strip(a) === strip(b);
	}

	/* The text is written like an address, but a different one than the link actually opens. */
	let deceptive = $derived.by((): boolean => {
		if (!targetHost) return false;
		const claimed = claimedHost(linkText);
		return !!claimed && !sameSite(claimed, targetHost);
	});

	/* An honest link whose text does not reveal where it leads ("click here") still gets the host
	 * appended, so the destination is never hidden. */
	let showHost = $derived(!!targetHost && isExternal && !deceptive && !linkText.toLowerCase().includes(targetHost.toLowerCase()));

	let elDialog = $state<any>(null);

	let dialogData = $derived({
		title: 'Check this link',
		body: dialogBody as any,
		icon: 'img/link.svg',
		buttons: [
			{ img: 'img/check.svg', text: 'Open anyway', onClick: confirmOpen, testId: 'message-link-open-btn' },
			{ img: 'img/cross.svg', text: 'Cancel', onClick: (): void => elDialog?.close(), focus: true, testId: 'message-link-cancel-btn' },
		],
	});

	function openTarget(): void {
		if (!target || !isSafeProtocol) return;
		window.open(target.href, '_blank', 'noopener,noreferrer');
	}

	function confirmOpen(): void {
		elDialog?.close();
		openTarget();
	}

	function onClick(event: MouseEvent): void {
		if (!isSafeProtocol) {
			event.preventDefault();
			return;
		}
		if (!deceptive) return; // let the browser follow an honest link normally
		event.preventDefault();
		elDialog?.open();
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		if (!deceptive) return;
		event.preventDefault();
		elDialog?.open();
	}
</script>

<style>
	.deceptive {
		/* A link that pretends to lead elsewhere must not look like an ordinary link. */
		text-decoration: underline wavy var(--danger-foreground, #c00);
		cursor: pointer;
	}

	.host {
		font-size: 0.85em;
		opacity: 0.75;
		white-space: nowrap;
	}

	.warning {
		color: var(--danger-foreground, #c00);
		font-size: 0.85em;
		white-space: nowrap;
	}

	.target {
		word-break: break-all;
	}
</style>

{#if isSafeProtocol}
	<a class:deceptive {href} target="_blank" rel="noopener noreferrer" onclick={onClick} onkeydown={onKeydown} data-testid="message-link">
		<MessageContentRenderer nodes={children} />
	</a>
	{#if deceptive}
		<span class="warning" data-testid="message-link-warning">&nbsp;⚠ goes to {targetHost}</span>
	{:else if showHost}
		<span class="host" data-testid="message-link-host">&nbsp;({targetHost})</span>
	{/if}
{:else}
	<!-- Unsupported scheme: show the text, never make it clickable -->
	<MessageContentRenderer nodes={children} />
{/if}

<Dialog data={dialogData} bind:this={elDialog} />

{#snippet dialogBody()}
	<div>This link says:</div>
	<div class="target"><span class="bold">{linkText}</span></div>
	<br />
	<div>but it actually opens:</div>
	<div class="target"><span class="bold">{target?.href}</span></div>
	<br />
	<div>Only continue if you trust <span class="bold">{targetHost}</span>.</div>
{/snippet}
