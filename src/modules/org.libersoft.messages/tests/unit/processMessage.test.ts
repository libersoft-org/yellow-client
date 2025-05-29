import { describe, expect, test } from 'vitest';
import { processMessage } from '../../messages';
//import util from 'util';

/*function printDOMTree(node, indent = 0) {
 console.log(`${' '.repeat(indent)}<${node.nodeName.toLowerCase()}>`);
 node.childNodes.forEach(child => printDOMTree(child, indent + 2));
}*/

describe('processMessage', () => {
	test('should create text node', () => {
		const message = 'Hello_World!';
		const { body, format } = processMessage({ format: 'text', message });
		expect(format).toBe('html');
		expect(body.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
		expect(body.childNodes.length).toBe(1);
		expect(body.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
		expect(body.childNodes[0].textContent).toBe(message);
	});

	test('should wrap custom elements Attachment in AttachmentsWrap', () => {
		const message = `<Attachment id="some-id-1"></Attachment><Attachment id="some-id-2"></Attachment><Attachment id="some-id-3"></Attachment>`;
		const { body, format } = processMessage({ format: 'html', message });
		expect(format).toBe('html');
		expect(body.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
		expect(body.childNodes.length).toBe(1);
		expect(body.childNodes[0].nodeName.toLowerCase()).toBe('attachmentswrapper');
		expect(body.childNodes[0].childNodes.length).toBe(3);
		expect(body.childNodes[0].childNodes[0].nodeName.toLowerCase()).toBe('attachment');
		expect(body.childNodes[0].childNodes[1].nodeName.toLowerCase()).toBe('attachment');
		expect(body.childNodes[0].childNodes[2].nodeName.toLowerCase()).toBe('attachment');
	});
});
