// modal-manager.ts
type ModalEntry = {
 id: number;
 setZIndex: (z: number) => void;
};

let counter = 100;
let modals: ModalEntry[] = [];

export function registerModal(setZIndex: (z: number) => void): number {
 const id = counter++;
 modals.push({ id, setZIndex });
 updateZIndices(id);
 return id;
}

export function unregisterModal(id: number) {
 modals = modals.filter(m => m.id !== id);
 updateZIndices(); // reassign after one closes
}

export function bringToFront(id: number) {
 updateZIndices(id);
}

function updateZIndices(focusId?: number) {
 let base = 100;
 modals.sort((a, b) => (a.id === focusId ? 1 : b.id === focusId ? -1 : 0));
 for (const modal of modals) {
  modal.setZIndex(base++);
 }
}
