export function attachParents(node: any, parent: any = null) {
	node.__parent = parent;
	(node.items ?? []).forEach((c: any) => attachParents(c, node));
	return node;
}
