export interface QueryResult {
	path: string;
	value: unknown;
}

export function queryPath(data: unknown, path: string): QueryResult[] {
	const trimmed = path.trim();
	if (!trimmed) return [{ path: "$", value: data }];
	if (!trimmed.startsWith("$")) throw new Error("Path must start with '$'.");

	const tokens = tokenize(trimmed);
	let current: Array<{ path: string; value: unknown }> = [{ path: "$", value: data }];

	for (const tok of tokens) {
		const next: Array<{ path: string; value: unknown }> = [];
		for (const item of current) {
			collect(item.value, item.path, tok, next);
		}
		current = next;
	}
	return current;
}

type Token =
	| { kind: "key"; name: string }
	| { kind: "index"; index: number }
	| { kind: "wildcard" }
	| { kind: "recursive" }
	| { kind: "slice"; start?: number; end?: number; step?: number };

function tokenize(path: string): Token[] {
	const tokens: Token[] = [];
	let i = 1;
	while (i < path.length) {
		const ch = path[i];
		if (ch === ".") {
			if (path[i + 1] === ".") {
				tokens.push({ kind: "recursive" });
				i += 2;
			} else {
				i++;
			}
			let name = "";
			while (i < path.length && /[A-Za-z0-9_$\-]/.test(path[i])) {
				name += path[i++];
			}
			if (path[i] === "*") {
				tokens.push({ kind: "wildcard" });
				i++;
			} else if (name) {
				tokens.push({ kind: "key", name });
			} else if (tokens.length > 0 && tokens[tokens.length - 1].kind === "recursive" && path[i] === "[") {
				// recursive followed directly by a bracket — leave for next iteration
			} else if (path[i] === "[") {
				// recursive followed by bracket without a name
			} else {
				throw new Error(`Unexpected token at ${i}.`);
			}
		} else if (ch === "[") {
			const end = path.indexOf("]", i);
			if (end < 0) throw new Error("Unterminated '['.");
			const inner = path.slice(i + 1, end);
			i = end + 1;
			if (inner === "*") {
				tokens.push({ kind: "wildcard" });
			} else if (inner.startsWith('"') || inner.startsWith("'")) {
				const q = inner[0];
				if (!inner.endsWith(q)) throw new Error("Unterminated quote.");
				tokens.push({ kind: "key", name: inner.slice(1, -1) });
			} else if (inner.includes(":")) {
				const parts = inner.split(":");
				const num = (s: string) => (s === "" ? undefined : Number(s));
				tokens.push({ kind: "slice", start: num(parts[0]), end: num(parts[1]), step: num(parts[2] ?? "") });
			} else if (/^-?\d+$/.test(inner)) {
				tokens.push({ kind: "index", index: Number(inner) });
			} else {
				throw new Error(`Unsupported bracket expression: [${inner}]`);
			}
		} else {
			throw new Error(`Unexpected character '${ch}' at ${i}.`);
		}
	}
	return tokens;
}

function collect(
	value: unknown,
	path: string,
	tok: Token,
	out: Array<{ path: string; value: unknown }>
): void {
	if (tok.kind === "recursive") {
		out.push({ path, value });
		walk(value, path, out);
		return;
	}
	if (tok.kind === "wildcard") {
		if (Array.isArray(value)) {
			value.forEach((v, i) => out.push({ path: `${path}[${i}]`, value: v }));
		} else if (value && typeof value === "object") {
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				out.push({ path: `${path}.${k}`, value: v });
			}
		}
		return;
	}
	if (tok.kind === "key") {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			const v = (value as Record<string, unknown>)[tok.name];
			if (v !== undefined) out.push({ path: `${path}.${tok.name}`, value: v });
		}
		return;
	}
	if (tok.kind === "index") {
		if (Array.isArray(value)) {
			const idx = tok.index < 0 ? value.length + tok.index : tok.index;
			if (idx >= 0 && idx < value.length) {
				out.push({ path: `${path}[${idx}]`, value: value[idx] });
			}
		}
		return;
	}
	if (tok.kind === "slice") {
		if (Array.isArray(value)) {
			const len = value.length;
			const step = tok.step ?? 1;
			const start = tok.start ?? (step > 0 ? 0 : len - 1);
			const end = tok.end ?? (step > 0 ? len : -1);
			if (step > 0) {
				for (let i = start; i < end && i < len; i += step) {
					if (i >= 0) out.push({ path: `${path}[${i}]`, value: value[i] });
				}
			} else if (step < 0) {
				for (let i = start; i > end && i >= 0; i += step) {
					if (i < len) out.push({ path: `${path}[${i}]`, value: value[i] });
				}
			}
		}
		return;
	}
}

function walk(value: unknown, path: string, out: Array<{ path: string; value: unknown }>): void {
	if (Array.isArray(value)) {
		value.forEach((v, i) => {
			const p = `${path}[${i}]`;
			out.push({ path: p, value: v });
			walk(v, p, out);
		});
	} else if (value && typeof value === "object") {
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const p = `${path}.${k}`;
			out.push({ path: p, value: v });
			walk(v, p, out);
		}
	}
}
