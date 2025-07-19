// window-manager.ts
type WindowEntry = {
	id: number;
	setZIndex: (z: number) => void;
};

const baseZIndex = 101;
let counter = baseZIndex;
let windows: WindowEntry[] = [];

export function registerWindow(setZIndex: (z: number) => void): number {
	const id = counter++;
	windows.push({ id, setZIndex });
	updateZIndices(id);
	return id;
}

export function unregisterWindow(id: number) {
	windows = windows.filter(m => m.id !== id);
	updateZIndices(); // reassign after one closes
}

export function bringToFront(id: number) {
	updateZIndices(id);
}

function updateZIndices(focusId?: number) {
	let base = baseZIndex;
	windows.sort((a, b) => (a.id === focusId ? 1 : b.id === focusId ? -1 : 0));
	for (const window of windows) {
		window.setZIndex(base++);
	}
}
