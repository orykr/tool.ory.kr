// RFC 6901 JSON Pointer.

export function escapeToken(token: string): string {
	return token.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function unescapeToken(token: string): string {
	return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

export function pointerTokens(pointer: string): string[] {
	if (pointer === "" || pointer === "#") return [];
	if (!pointer.startsWith("/") && !pointer.startsWith("#/")) {
		throw new Error("Pointer must start with '/' (or '#/').");
	}
	const path = pointer.startsWith("#") ? pointer.slice(1) : pointer;
	return path.split("/").slice(1).map(unescapeToken);
}

export function get(value: unknown, pointer: string): unknown {
	const tokens = pointerTokens(pointer);
	let cur: unknown = value;
	for (const tok of tokens) {
		if (cur === null || cur === undefined) {
			throw new Error(`Cannot resolve '${tok}' on null/undefined.`);
		}
		if (Array.isArray(cur)) {
			if (tok === "-") throw new Error("'-' refers to one past the end (no value).");
			if (!/^\d+$/.test(tok)) throw new Error(`Array index must be numeric: '${tok}'`);
			const idx = Number(tok);
			cur = (cur as unknown[])[idx];
		} else if (typeof cur === "object") {
			cur = (cur as Record<string, unknown>)[tok];
		} else {
			throw new Error(`Cannot index into ${typeof cur} with '${tok}'.`);
		}
	}
	return cur;
}

export function listAllPointers(value: unknown, base = ""): string[] {
	const out: string[] = [base];
	if (value && typeof value === "object") {
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				out.push(...listAllPointers(value[i], `${base}/${i}`));
			}
		} else {
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				out.push(...listAllPointers(v, `${base}/${escapeToken(k)}`));
			}
		}
	}
	return out;
}
