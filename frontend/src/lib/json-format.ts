export type JsonFormatResult =
	| { ok: true; output: string }
	| { ok: false; error: string; line?: number; column?: number };

export function formatJson(input: string, indent: number | "\t", sortKeys = false): JsonFormatResult {
	if (!input.trim()) {
		return { ok: true, output: "" };
	}
	try {
		const parsed = JSON.parse(input);
		const value = sortKeys ? sortObjectKeys(parsed) : parsed;
		const output = JSON.stringify(value, null, indent);
		return { ok: true, output };
	} catch (e) {
		return parseJsonError(input, e as Error);
	}
}

export function minifyJson(input: string): JsonFormatResult {
	if (!input.trim()) return { ok: true, output: "" };
	try {
		return { ok: true, output: JSON.stringify(JSON.parse(input)) };
	} catch (e) {
		return parseJsonError(input, e as Error);
	}
}

function parseJsonError(input: string, err: Error): JsonFormatResult {
	const message = err.message;
	const posMatch = message.match(/position (\d+)/i);
	if (!posMatch) return { ok: false, error: message };

	const pos = Number(posMatch[1]);
	const upTo = input.slice(0, pos);
	const line = upTo.split("\n").length;
	const column = pos - upTo.lastIndexOf("\n");
	return { ok: false, error: message, line, column };
}

function sortObjectKeys(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(sortObjectKeys);
	if (value && typeof value === "object") {
		return Object.keys(value as Record<string, unknown>)
			.sort()
			.reduce<Record<string, unknown>>((acc, key) => {
				acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
				return acc;
			}, {});
	}
	return value;
}
