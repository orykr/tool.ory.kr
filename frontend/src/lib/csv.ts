export interface CsvParseResult {
	headers: string[];
	rows: string[][];
}

export function parseCsv(text: string, delimiter = ","): CsvParseResult {
	const records: string[][] = [];
	let field = "";
	let row: string[] = [];
	let inQuotes = false;
	let i = 0;
	const len = text.length;

	while (i < len) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += ch;
			i++;
			continue;
		}
		if (ch === '"') {
			inQuotes = true;
			i++;
			continue;
		}
		if (ch === delimiter) {
			row.push(field);
			field = "";
			i++;
			continue;
		}
		if (ch === "\n" || ch === "\r") {
			row.push(field);
			records.push(row);
			row = [];
			field = "";
			if (ch === "\r" && text[i + 1] === "\n") i += 2;
			else i++;
			continue;
		}
		field += ch;
		i++;
	}

	if (field.length > 0 || row.length > 0) {
		row.push(field);
		records.push(row);
	}

	const filtered = records.filter((r) => r.length > 0 && !(r.length === 1 && r[0] === ""));
	if (filtered.length === 0) return { headers: [], rows: [] };

	const [headers, ...rows] = filtered;
	return { headers, rows };
}

export function csvToJson(text: string, delimiter = ","): unknown[] {
	const { headers, rows } = parseCsv(text, delimiter);
	return rows.map((row) => {
		const obj: Record<string, string> = {};
		headers.forEach((h, i) => {
			obj[h] = row[i] ?? "";
		});
		return obj;
	});
}

export function jsonToCsv(data: unknown, delimiter = ","): string {
	if (!Array.isArray(data)) {
		throw new Error("JSON must be an array of objects.");
	}
	if (data.length === 0) return "";

	const headerSet = new Set<string>();
	for (const item of data) {
		if (item && typeof item === "object" && !Array.isArray(item)) {
			for (const key of Object.keys(item)) headerSet.add(key);
		} else {
			throw new Error("Each row must be an object.");
		}
	}

	const headers = Array.from(headerSet);
	const lines: string[] = [headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter)];
	for (const item of data as Record<string, unknown>[]) {
		const row = headers.map((h) => escapeCsvField(formatValue(item[h]), delimiter));
		lines.push(row.join(delimiter));
	}
	return lines.join("\n");
}

function formatValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function escapeCsvField(field: string, delimiter: string): string {
	if (field.includes('"') || field.includes(delimiter) || /[\r\n]/.test(field)) {
		return `"${field.replace(/"/g, '""')}"`;
	}
	return field;
}
