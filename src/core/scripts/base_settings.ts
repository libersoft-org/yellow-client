export function attachParents(node: any, parent: any = null) {
	if (parent) {
		node.__parent = new WeakRef(parent);
	}
	(node.items ?? []).forEach((c: any) => attachParents(c, node));
	return node;
}
