<script lang="ts">
	import Prism from 'prismjs';
	import 'prismjs/components/prism-json';
	import { log } from '@/core/tauri.ts';

	type Props = {
		code: string;
	};

	let { code = $bindable(' ') }: Props = $props();

	let language = 'json';
	let elDiv: HTMLDivElement | null = $state(null);

	// Keep track of cursor position for better restoration
	let lastCursorPos = $state(0);

	// Helper function to get current cursor position
	function getCursorPosition() {
		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return 0;

		// Get all text content up to cursor
		const range = selection.getRangeAt(0).cloneRange();
		range.setStart(elDiv, 0);
		range.setEnd(selection.focusNode, selection.focusOffset);
		return range.toString().length;
	}

	// Helper function to set cursor position by character index
	function setCursorPosition(position) {
		if (!elDiv) return;

		position = Math.max(0, Math.min(position, (elDiv.textContent || '').length));

		const selection = window.getSelection();
		if (!selection) return;

		// Find the correct node and offset
		const nodeStack = [elDiv];
		let currentNode;
		let charCount = 0;
		let foundNode = null;
		let foundOffset = 0;

		// Traverse DOM to find position
		while (nodeStack.length > 0) {
			currentNode = nodeStack.pop();

			if (currentNode.nodeType === Node.TEXT_NODE) {
				const nodeLength = currentNode.textContent?.length || 0;

				// Found the node where our position is
				if (charCount + nodeLength >= position) {
					foundNode = currentNode;
					foundOffset = position - charCount;
					break;
				}

				charCount += nodeLength;
			} else {
				// Process children in reverse order (for stack)
				const children = Array.from(currentNode.childNodes);
				for (let i = children.length - 1; i >= 0; i--) {
					nodeStack.push(children[i]);
				}
			}
		}

		// Set the cursor position
		if (foundNode) {
			try {
				const range = document.createRange();
				range.setStart(foundNode, foundOffset);
				range.setEnd(foundNode, foundOffset);
				selection.removeAllRanges();
				selection.addRange(range);
			} catch (error) {
				console.error('Error setting cursor position:', error);
			}
		}
	}

	$effect(() => {
		if (!elDiv) return;

		try {
			console.log('Prism highlight input:', code);
			const result = '<code class="language-json">' + Prism.highlight(code, Prism.languages[language], language) + '</code>';
			console.log('Prism highlight output:', result);

			// Get current cursor position
			const isActive = document.activeElement === elDiv;
			if (isActive) {
				lastCursorPos = getCursorPosition();
			}

			// Apply highlighting
			elDiv.innerHTML = result;

			// Restore cursor position if the element was focused
			if (isActive) {
				// Delay restoration to allow DOM updates
				setTimeout(() => {
					setCursorPosition(lastCursorPos);
					elDiv.focus();
				}, 0);
			}
		} catch (error) {
			log.error('Prism highlight error:', error);
			elDiv.innerHTML = code;
		}
	});

	function pastePlainText(event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') || '';
		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		// Get current position before paste
		const currentPos = getCursorPosition();

		// Insert text at cursor
		selection.deleteFromDocument();
		selection.getRangeAt(0).insertNode(document.createTextNode(text));

		// Calculate new cursor position (current + pasted length)
		lastCursorPos = currentPos + text.length;

		// Force re-highlight with cursor position preserved
		code = elDiv?.innerText || '';
	}

	// Handle keydown events, especially Enter key
	function handleKeyDown(event: KeyboardEvent) {
		// Handle Enter key to prevent inserting multiple newlines
		if (event.key === 'Enter') {
			event.preventDefault();

			// Get current position
			const pos = getCursorPosition();

			// Get current text
			const currentText = elDiv?.innerText || '';

			// Insert a single newline at cursor position
			const newText = currentText.slice(0, pos) + '\n' + currentText.slice(pos);

			// Update text
			code = newText;

			// Set cursor position after the inserted newline
			lastCursorPos = pos + 1;

			// Need to manually trigger update since we're preventing default
			setTimeout(() => {
				setCursorPosition(lastCursorPos);
			}, 0);
		}
	}
</script>

<style>
	.code-wrapper {
		white-space: pre-wrap;
		padding: 24px;
		border: 1px solid #888;
		scrollbar-width: none;
		background-color: #222;
		foreground-color: #fff3eb;
		max-width: 500px;
		width: 100vw;
		max-width: 700px;
		width: auto;
		outline: none;
		font-size: clamp(12px, 1.4vw, 14px);
		caret-color: white !important;
		min-width: fit-content;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	:global {
		/* Make sure code inside our editor is editable */

		.code-wrapper code {
			cursor: text;
			caret-color: white;
		}

		code[class*='language-'],
		pre[class*='language-'] {
			font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console', 'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono', 'Nimbus Mono L', 'Courier New', Courier, monospace;
			font-size: 14px;
			line-height: 1.375;
			direction: ltr;
			text-align: left;
			white-space: pre;
			word-spacing: normal;
			word-break: normal;

			-moz-tab-size: 4;
			-o-tab-size: 4;
			tab-size: 4;

			-webkit-hyphens: none;
			-moz-hyphens: none;
			-ms-hyphens: none;
			hyphens: none;
			/* background: #322d29; */
			color: #88786d;
		}

		pre > code[class*='language-'] {
			font-size: 1em;
		}

		pre[class*='language-']::-moz-selection,
		pre[class*='language-'] ::-moz-selection,
		code[class*='language-']::-moz-selection,
		code[class*='language-'] ::-moz-selection {
			text-shadow: none;
			background: #6f5849;
		}

		pre[class*='language-']::selection,
		pre[class*='language-'] ::selection,
		code[class*='language-']::selection,
		code[class*='language-'] ::selection {
			text-shadow: none;
			background: #6f5849;
		}

		pre[class*='language-'] {
			padding: 1em;
			margin: 0.5em 0;
			overflow: auto;
		}

		:not(pre) > code[class*='language-'] {
			padding: 0.1em;
			border-radius: 0.3em;
		}

		.token.comment,
		.token.prolog,
		.token.doctype,
		.token.cdata {
			color: #6a5f58;
		}

		.token.punctuation {
			color: #6a5f58;
		}

		.token.namespace {
			opacity: 0.7;
		}

		.token.tag,
		.token.operator,
		.token.number {
			color: #bfa05a;
		}

		.token.property,
		.token.function {
			color: #88786d;
		}

		.token.tag-id,
		.token.selector,
		.token.atrule-id {
			color: #fff3eb;
		}

		code.language-javascript,
		.token.attr-name {
			color: #a48774;
		}

		code.language-css,
		code.language-scss,
		.token.boolean,
		.token.string,
		.token.entity,
		.token.url,
		.language-css .token.string,
		.language-scss .token.string,
		.style .token.string,
		.token.attr-value,
		.token.keyword,
		.token.control,
		.token.directive,
		.token.unit,
		.token.statement,
		.token.regex,
		.token.atrule {
			color: #fcc440;
		}

		.token.placeholder,
		.token.variable {
			color: #fcc440;
		}

		.token.deleted {
			text-decoration: line-through;
		}

		.token.inserted {
			border-bottom: 1px dotted #fff3eb;
			text-decoration: none;
		}

		.token.italic {
			font-style: italic;
		}

		.token.important,
		.token.bold {
			font-weight: bold;
		}

		.token.important {
			color: #a48774;
		}

		.token.entity {
			cursor: help;
		}

		pre > code.highlight {
			outline: 0.4em solid #816d5f;
			outline-offset: 0.4em;
		}

		.line-numbers.line-numbers .line-numbers-rows {
			border-right-color: #35302b;
		}

		.line-numbers .line-numbers-rows > span:before {
			color: #46403d;
		}

		.line-highlight.line-highlight {
			background: rgba(191, 160, 90, 0.2);
			background: -webkit-linear-gradient(left, rgba(191, 160, 90, 0.2) 70%, rgba(191, 160, 90, 0));
			background: linear-gradient(to right, rgba(191, 160, 90, 0.2) 70%, rgba(191, 160, 90, 0));
		}
	}
</style>

<div
	bind:this={elDiv}
	class="code-wrapper"
	contenteditable
	spellcheck="false"
	role="textbox"
	oninput={e => {
		// Save current cursor position before updating
		lastCursorPos = getCursorPosition();

		// Update code with the new content
		const newText = elDiv?.innerText || '';
		if (newText !== code) {
			// Use setTimeout to avoid cursor jumping by postponing the update until after this event handler completes
			setTimeout(() => {
				code = newText;
			}, 0);
		}
	}}
	onkeydown={handleKeyDown}
	onpaste={pastePlainText}
	onfocus={() => {
		// Ensure we have content for cursor to appear when focused
		if (!elDiv.innerHTML || elDiv.innerHTML.trim() === '') {
			elDiv.innerHTML = '<code class="language-json"> </code>';
			// Place cursor at beginning
			const selection = window.getSelection();
			if (selection) {
				const range = document.createRange();
				const codeElement = elDiv.querySelector('code');
				if (codeElement && codeElement.firstChild) {
					range.setStart(codeElement.firstChild, 0);
					range.collapse(true);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
	}}
>
	<code class="language-json">{code || ' '}</code>
</div>
