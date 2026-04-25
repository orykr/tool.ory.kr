export interface EnvEntry {
	key: string;
	value: string;
	exported: boolean;
	line: number;
}

export function parseDotenv(input: string): { entries: EnvEntry[]; errors: Array<{ line: number; message: string }> } {
	const entries: EnvEntry[] = [];
	const errors: Array<{ line: number; message: string }> = [];
	const lines = input.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i];
		const lineNumber = i + 1;
		const trimmed = raw.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const exportMatch = /^export\s+/.exec(trimmed);
		const body = exportMatch ? trimmed.slice(exportMatch[0].length) : trimmed;
		const eq = body.indexOf("=");
		if (eq === -1) {
			errors.push({ line: lineNumber, message: `Missing '=' on line ${lineNumber}.` });
			continue;
		}
		const key = body.slice(0, eq).trim();
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
			errors.push({ line: lineNumber, message: `Invalid key '${key}' on line ${lineNumber}.` });
			continue;
		}
		let value = body.slice(eq + 1);
		const inlineComment = stripInlineComment(value);
		value = inlineComment.trim();
		const unquoted = unquote(value);
		entries.push({
			key,
			value: unquoted,
			exported: !!exportMatch,
			line: lineNumber
		});
	}
	return { entries, errors };
}

function stripInlineComment(input: string): string {
	let inSingle = false;
	let inDouble = false;
	for (let i = 0; i < input.length; i++) {
		const c = input[i];
		if (c === "\\") {
			i++;
			continue;
		}
		if (c === '"' && !inSingle) inDouble = !inDouble;
		else if (c === "'" && !inDouble) inSingle = !inSingle;
		else if (c === "#" && !inSingle && !inDouble) return input.slice(0, i);
	}
	return input;
}

function unquote(value: string): string {
	if (value.length >= 2) {
		const first = value[0];
		const last = value[value.length - 1];
		if (first === '"' && last === '"') {
			return value
				.slice(1, -1)
				.replace(/\\n/g, "\n")
				.replace(/\\r/g, "\r")
				.replace(/\\t/g, "\t")
				.replace(/\\"/g, '"')
				.replace(/\\\\/g, "\\");
		}
		if (first === "'" && last === "'") {
			return value.slice(1, -1);
		}
	}
	return value;
}

export function envToJson(entries: EnvEntry[]): Record<string, string> {
	const obj: Record<string, string> = {};
	for (const e of entries) obj[e.key] = e.value;
	return obj;
}

export function envToShellExport(entries: EnvEntry[]): string {
	return entries
		.map((e) => `export ${e.key}=${shellQuote(e.value)}`)
		.join("\n");
}

function shellQuote(value: string): string {
	if (/^[A-Za-z0-9_./:=@-]*$/.test(value)) return value;
	return `'${value.replace(/'/g, `'\\''`)}'`;
}
