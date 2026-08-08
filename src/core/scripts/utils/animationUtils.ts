export function highlightElement(el: HTMLElement): void {
	const durationFromCSS = getComputedStyle(el).getPropertyValue('--animation-highlight-duration').trim();
	el.classList.add('animation-highlight');
	setTimeout(
		() => {
			el.classList.remove('animation-highlight');
		},
		durationFromCSS ? parseFloat(durationFromCSS) * 1000 : 500
	);
}
