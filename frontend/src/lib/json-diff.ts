export type DiffEntry =
	| { kind: "added"; path: string; value: unknown }
	| { kind: "removed"; path: string; value: unknown }
	| { kind: "changed"; path: string; from: unknown; to: unknown };

export function diffJson(a: unknown, b: unknown, path = "$"): DiffEntry[] {
	const out: DiffEntry[] = [];
	walk(a, b, path, out);
	return out;
}

function walk(a: unknown, b: unknown, path: string, out: DiffEntry[]): void {
	if (deepEqual(a, b)) return;

	if (typeof a !== typeof b || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
		out.push({ kind: "changed", path, from: a, to: b });
		return;
	}

	if (Array.isArray(a) && Array.isArray(b)) {
		const max = Math.max(a.length, b.length);
		for (let i = 0; i < max; i++) {
			const childPath = `${path}[${i}]`;
			if (i >= a.length) out.push({ kind: "added", path: childPath, value: b[i] });
			else if (i >= b.length) out.push({ kind: "removed", path: childPath, value: a[i] });
			else walk(a[i], b[i], childPath, out);
		}
		return;
	}

	if (a && b && typeof a === "object" && typeof b === "object") {
		const aObj = a as Record<string, unknown>;
		const bObj = b as Record<string, unknown>;
		const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
		for (const k of keys) {
			const childPath = `${path}.${k}`;
			if (!(k in aObj)) out.push({ kind: "added", path: childPath, value: bObj[k] });
			else if (!(k in bObj)) out.push({ kind: "removed", path: childPath, value: aObj[k] });
			else walk(aObj[k], bObj[k], childPath, out);
		}
		return;
	}

	out.push({ kind: "changed", path, from: a, to: b });
}

function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a !== typeof b || a === null || b === null) return false;
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
		return true;
	}
	if (typeof a === "object" && typeof b === "object") {
		const aKeys = Object.keys(a as Record<string, unknown>);
		const bKeys = Object.keys(b as Record<string, unknown>);
		if (aKeys.length !== bKeys.length) return false;
		for (const k of aKeys) {
			if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
			if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
		}
		return true;
	}
	return false;
}
