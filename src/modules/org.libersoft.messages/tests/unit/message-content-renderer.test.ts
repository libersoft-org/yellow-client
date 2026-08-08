import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/svelte';

/* The real component map pulls in every message component (and with them lottie/canvas), which is
 * irrelevant here - these tests are about the tree the renderer builds from plain HTML. */
vi.mock('@/org.libersoft.messages/scripts/message-content.ts', (): any => ({ componentMap: {} }));
vi.mock('@/core/scripts/stores.ts', async (): Promise<any> => {
	const { writable } = await import('svelte/store');
	return { debug: writable(false) };
});

const { default: MessageContentRenderer } = await import('@/org.libersoft.messages/components/MessageContent/MessageContentRenderer.svelte');

function fragment(html: string): DocumentFragment {
	const template = document.createElement('template');
	template.innerHTML = html;
	return template.content;
}

describe('MessageContentRenderer', (): void => {
	test('renders each node exactly once', (): void => {
		const { container } = render(MessageContentRenderer, { props: { rootNode: fragment('<p><em>a</em><em>b</em></p>') } });
		expect(container.querySelectorAll('em').length).toBe(2);
		expect(container.textContent?.replace(/\s+/g, '')).toBe('ab');
	});

	/* The renderer used to recurse on the parent node once per child, so a branching tree produced
	 * k^depth copies of its own content. A 3x3x3 tree is enough to catch a regression. */
	test('does not duplicate content in a branching tree', (): void => {
		const leaf = '<em>x</em>';
		const level2 = `<code>${leaf.repeat(3)}</code>`;
		const level1 = `<blockquote>${level2.repeat(3)}</blockquote>`;
		const { container } = render(MessageContentRenderer, { props: { rootNode: fragment(`<p>${level1.repeat(3)}</p>`) } });
		expect(container.querySelectorAll('blockquote').length).toBe(3);
		expect(container.querySelectorAll('code').length).toBe(9);
		expect(container.querySelectorAll('em').length).toBe(27);
	});

	test('bounds a pathologically deep tree', (): void => {
		/* blockquote nests, unlike <p> which the HTML parser auto-closes. */
		let html = 'deep';
		for (let i = 0; i < 200; i++) html = `<blockquote>${html}</blockquote>`;
		const { container } = render(MessageContentRenderer, { props: { rootNode: fragment(html) } });
		/* Rendering stops adding elements past the depth cap but keeps the text. */
		expect(container.querySelectorAll('blockquote').length).toBeLessThanOrEqual(33);
		expect(container.textContent).toContain('deep');
	});
});
