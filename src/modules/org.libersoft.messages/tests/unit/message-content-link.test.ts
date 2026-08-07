import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/svelte';

/* Keep the real component map (and the media components behind it) out of this test - only the
 * link rendering matters here. */
vi.mock('@/org.libersoft.messages/scripts/message-content.ts', (): any => ({ componentMap: {} }));
vi.mock('@/core/scripts/stores.ts', async (): Promise<any> => {
	const { writable } = await import('svelte/store');
	return { debug: writable(false), isMobile: writable(false) };
});

const { default: MessageContentLink } = await import('@/org.libersoft.messages/components/MessageContentLink/MessageContentLink.svelte');

/** Builds the props the renderer hands to a custom component for `<a href=...>text</a>`. */
function linkProps(href: string, text: string): Record<string, unknown> {
	const template = document.createElement('template');
	template.innerHTML = `<a href="${href}">${text}</a>`;
	const node = template.content.firstElementChild as HTMLAnchorElement;
	return {
		href,
		node,
		children: [{ tagUniqueId: 'text-0', text, level: 1 }],
	};
}

describe('MessageContentLink', (): void => {
	test('renders an honest link without decoration', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://example.com/page', 'https://example.com/page') });
		const anchor = container.querySelector('a');
		expect(anchor).not.toBeNull();
		expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
		expect(container.querySelector('[data-testid="message-link-warning"]')).toBeNull();
		expect(container.querySelector('[data-testid="message-link-host"]')).toBeNull();
	});

	test('discloses the destination when the text hides it', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://example.com/page', 'click here') });
		expect(container.querySelector('[data-testid="message-link-host"]')?.textContent).toContain('example.com');
	});

	/* The attack this component exists for: the text names one site, the href opens another. */
	test('warns when the link text impersonates a different site', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://evil.test/login', 'https://yellow.libersoft.org') });
		const warning = container.querySelector('[data-testid="message-link-warning"]');
		expect(warning?.textContent).toContain('evil.test');
		expect(container.querySelector('a')?.className).toContain('deceptive');
	});

	test('treats a bare domain in the text as a claim too', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://evil.test/', 'yellow.libersoft.org') });
		expect(container.querySelector('[data-testid="message-link-warning"]')).not.toBeNull();
	});

	test('does not warn about a www prefix mismatch', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://www.example.com/', 'https://example.com') });
		expect(container.querySelector('[data-testid="message-link-warning"]')).toBeNull();
	});

	test('does not warn when the text is not an address at all', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('https://example.com/', 'our documentation') });
		expect(container.querySelector('[data-testid="message-link-warning"]')).toBeNull();
	});

	test('never makes an unsupported scheme clickable', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('file:///etc/passwd', 'open this') });
		expect(container.querySelector('a')).toBeNull();
		expect(container.textContent).toContain('open this');
	});

	test('leaves host-less schemes alone', (): void => {
		const { container } = render(MessageContentLink, { props: linkProps('mailto:someone@example.com', 'someone@example.com') });
		expect(container.querySelector('a')).not.toBeNull();
		expect(container.querySelector('[data-testid="message-link-warning"]')).toBeNull();
		expect(container.querySelector('[data-testid="message-link-host"]')).toBeNull();
	});
});
