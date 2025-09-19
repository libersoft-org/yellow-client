import type { ISettingsNode } from '@/core/types/settings.ts';

export function attachParents<T extends ISettingsNode>(node: T, parent: ISettingsNode | null = null): T {
	/* fixme: rename attachParents to something more genreal like initializeSettingsNode */
	if (!node.states) {
		node.states = new Map();
	}
	if (parent) {
		node.__parent = new WeakRef(parent);
	}
	(node.items ?? []).forEach(c => attachParents(c, node));
	return node;
}
