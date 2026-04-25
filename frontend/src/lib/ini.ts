type IniValue = string | number | boolean;
type IniSection = Record<string, IniValue>;
export type IniData = Record<string, IniValue | IniSection>;

export function parseIni(input: string): IniData {
	const result: IniData = {};
	let current: Record<string, IniValue> = result as Record<string, IniValue>;
	const lines = input.split(/\r?\n/);
	let i = 0;
	for (const rawLine of lines) {
		i++;
		const line = stripComment(rawLine).trim();
		if (!line) continue;
		const sectionMatch = line.match(/^\[(.+)\]$/);
		if (sectionMatch) {
			const name = sectionMatch[1].trim();
			if (!name) throw new Error(`Empty section name on line ${i}.`);
			result[name] = {};
			current = result[name] as Record<string, IniValue>;
			continue;
		}
		const eq = line.indexOf("=");
		if (eq === -1) throw new Error(`Expected 'key = value' on line ${i}: ${line}`);
		const key = line.slice(0, eq).trim();
		const value = line.slice(eq + 1).trim();
		if (!key) throw new Error(`Empty key on line ${i}.`);
		current[key] = parseIniValue(value);
	}
	return result;
}

function stripComment(line: string): string {
	let result = "";
	let inQuote: '"' | "'" | null = null;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuote) {
			if (ch === inQuote) inQuote = null;
			result += ch;
		} else if (ch === '"' || ch === "'") {
			inQuote = ch;
			result += ch;
		} else if (ch === ";" || ch === "#") {
			break;
		} else {
			result += ch;
		}
	}
	return result;
}

function parseIniValue(value: string): IniValue {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
	if (/^-?\d*\.\d+$/.test(trimmed)) return Number(trimmed);
	return trimmed;
}

export function stringifyIni(data: unknown): string {
	if (!data || typeof data !== "object" || Array.isArray(data)) {
		throw new Error("Top-level value must be an object.");
	}
	const obj = data as Record<string, unknown>;
	const topLevel: string[] = [];
	const sections: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			sections.push(`[${key}]`);
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				if (v !== null && (typeof v === "object" || Array.isArray(v))) {
					throw new Error(`Nested objects/arrays are not supported in INI (at ${key}.${k}).`);
				}
				sections.push(`${k} = ${formatIniValue(v)}`);
			}
			sections.push("");
		} else {
			topLevel.push(`${key} = ${formatIniValue(value)}`);
		}
	}

	const parts: string[] = [];
	if (topLevel.length) parts.push(topLevel.join("\n"));
	if (sections.length) parts.push(sections.join("\n"));
	return parts.join("\n\n").trim() + "\n";
}

function formatIniValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number") return String(value);
	const s = String(value);
	if (/^[A-Za-z0-9._@/-]*$/.test(s) && !s.includes("\n") && s !== "true" && s !== "false") return s;
	return `"${s.replace(/"/g, '\\"')}"`;
}
