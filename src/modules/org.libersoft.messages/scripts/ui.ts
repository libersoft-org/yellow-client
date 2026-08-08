export function longpress(node: HTMLElement, threshold: number = 300): { destroy(): void } {
	const handle_mousedown = (e: MouseEvent): void => {
		node.dispatchEvent(new CustomEvent('mymousedown', { detail: e }));

		const timeout = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('longpress', { detail: e }));
		}, threshold);

		const cancel = (_e: Event): void => {
			clearTimeout(timeout);
			node.removeEventListener('mousemove', cancel);
			node.removeEventListener('mouseup', cancel);
			node.removeEventListener('click', cancel);
		};

		node.addEventListener('mousemove', cancel);
		node.addEventListener('mouseup', cancel);
		node.addEventListener('click', cancel);
	};

	node.addEventListener('mousedown', handle_mousedown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handle_mousedown);
		},
	};
}
