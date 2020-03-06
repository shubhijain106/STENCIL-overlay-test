export function eventPath(evt: Event): Array<Node> {
	var path =
			((evt as any).composedPath && (evt as any).composedPath()) ||
			(evt as any).path,
		target = evt.target;

	if (path != null) {
		// Safari doesn't include Window, but it should.
		return path.indexOf(window) < 0 ? path.concat(window) : path;
	}

	if (target === window) {
		return [window as any];
	}

	function getParents(node: Node, memo: Array<Node> = []) {
		var parentNode = node.parentNode;

		if (!parentNode) {
			return memo;
		} else {
			return getParents(parentNode, memo.concat(parentNode));
		}
	}

	return [target as Node].concat(getParents(target as Node), window as any);
}
