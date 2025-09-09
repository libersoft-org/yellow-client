import type { ISettingsNode } from '@/core/types/settings.ts';

export function attachParents<T extends ISettingsNode>(node: T, parent: ISettingsNode | null = null): T {
	if (parent) {
		node.__parent = new WeakRef(parent);
	}
	(node.items ?? []).forEach(c => attachParents(c, node));
	return node;
}
