import { describe, expect, test } from 'vitest';
import { saneHtml } from '@/org.libersoft.messages/scripts/messages.ts';

function html(fragment: DocumentFragment): string {
	const div = document.createElement('div');
	div.appendChild(fragment.cloneNode(true));
	return div.innerHTML;
}

describe('saneHtml', (): void => {
	test('keeps the formatting tags the app renders', (): void => {
		const out = html(saneHtml('<p>hello <strong>world</strong><br /><a href="https://example.com">link</a></p>'));
		expect(out).toContain('<strong>world</strong>');
		expect(out).toContain('<br>');
		expect(out).toContain('href="https://example.com"');
	});

	test('keeps custom message tags and their attributes', (): void => {
		const out = html(saneHtml('<Imaged file="yellow:abc"></Imaged><Attachment id="xyz"></Attachment>'));
		expect(out).toContain('file="yellow:abc"');
		expect(out).toContain('id="xyz"');
	});

	test('drops form controls a sender could use for phishing', (): void => {
		const out = html(saneHtml('<form action="https://evil.test"><input name="password" type="password" /><button>Log in</button></form>'));
		expect(out).not.toContain('<form');
		expect(out).not.toContain('<input');
		expect(out).not.toContain('<button');
	});

	test('drops overlay and styling vectors', (): void => {
		const out = html(saneHtml('<div style="position:fixed;inset:0" class="overlay" id="fake">x</div><span style="color:red">y</span>'));
		expect(out).not.toContain('style=');
		expect(out).not.toContain('class=');
		expect(out).not.toContain('<div');
	});

	test('drops id and alt from standard elements but keeps them on custom tags', (): void => {
		const out = html(saneHtml('<p id="spoof">t</p><Gif file="x" alt="GIF"></Gif>'));
		expect(out).not.toContain('id="spoof"');
		expect(out).toContain('alt="GIF"');
	});

	test('drops scripts, iframes and event handlers', (): void => {
		const out = html(saneHtml('<script>alert(1)</script><iframe src="https://evil.test"></iframe><p onclick="alert(1)">t</p>'));
		expect(out).not.toContain('<script');
		expect(out).not.toContain('<iframe');
		expect(out).not.toContain('onclick');
	});

	test('drops data attributes', (): void => {
		const out = html(saneHtml('<p data-anything="1">t</p>'));
		expect(out).not.toContain('data-anything');
	});

	test('bounds absurdly long input', (): void => {
		const out = html(saneHtml('<p>' + 'a'.repeat(400_000) + '</p>'));
		expect(out.length).toBeLessThan(300_000);
	});
});
