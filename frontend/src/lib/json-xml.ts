export function jsonToXml(value: unknown, rootName = "root"): string {
	return `<?xml version="1.0" encoding="UTF-8"?>\n${render(safeName(rootName), value, 0)}`;
}

function render(tag: string, value: unknown, depth: number): string {
	const indent = "  ".repeat(depth);
	if (value === null || value === undefined) return `${indent}<${tag}/>`;

	if (Array.isArray(value)) {
		const itemTag = singularize(tag);
		const inner = value.map((v) => render(itemTag, v, depth + 1)).join("\n");
		return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`;
	}

	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		const attrs: string[] = [];
		let textContent: string | null = null;
		const childEntries: Array<[string, unknown]> = [];
		for (const [k, v] of entries) {
			if (k.startsWith("@") && k.length > 1) {
				attrs.push(`${safeName(k.slice(1))}="${escapeXmlAttr(formatPrimitive(v))}"`);
			} else if (k === "#text") {
				textContent = formatPrimitive(v);
			} else {
				childEntries.push([k, v]);
			}
		}

		const open = attrs.length > 0 ? `<${tag} ${attrs.join(" ")}` : `<${tag}`;

		if (childEntries.length === 0 && textContent === null) {
			return `${indent}${open}/>`;
		}
		if (childEntries.length === 0 && textContent !== null) {
			return `${indent}${open}>${escapeXml(textContent)}</${tag}>`;
		}

		const innerLines: string[] = [];
		if (textContent !== null && textContent.trim()) {
			innerLines.push(`${"  ".repeat(depth + 1)}${escapeXml(textContent)}`);
		}
		for (const [k, v] of childEntries) {
			innerLines.push(render(safeName(k), v, depth + 1));
		}
		return `${indent}${open}>\n${innerLines.join("\n")}\n${indent}</${tag}>`;
	}

	return `${indent}<${tag}>${escapeXml(String(value))}</${tag}>`;
}

function formatPrimitive(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function singularize(name: string): string {
	if (name.endsWith("ies")) return name.slice(0, -3) + "y";
	if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
	return "item";
}

function safeName(name: string): string {
	const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, "_") || "item";
	if (/^[0-9-]/.test(cleaned)) return "_" + cleaned;
	return cleaned;
}

function escapeXml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXmlAttr(text: string): string {
	return escapeXml(text).replace(/"/g, "&quot;");
}

export function xmlToJson(xml: string): unknown {
	if (typeof DOMParser === "undefined") throw new Error("DOMParser not available.");
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, "application/xml");
	const err = doc.querySelector("parsererror");
	if (err) throw new Error(err.textContent?.trim() ?? "Invalid XML.");
	if (!doc.documentElement) throw new Error("No root element.");
	return { [doc.documentElement.tagName]: elementToJson(doc.documentElement) };
}

function elementToJson(element: Element): unknown {
	const elementChildren = Array.from(element.children);
	const textContent = Array.from(element.childNodes)
		.filter((n) => n.nodeType === 3)
		.map((n) => n.nodeValue ?? "")
		.join("");

	if (elementChildren.length === 0) {
		const text = textContent;
		if (element.attributes.length === 0) return text === "" ? null : text;
		const obj: Record<string, unknown> = {};
		for (const attr of Array.from(element.attributes)) {
			obj[`@${attr.name}`] = attr.value;
		}
		if (text.trim()) obj["#text"] = text;
		return obj;
	}

	const result: Record<string, unknown> = {};
	for (const attr of Array.from(element.attributes)) {
		result[`@${attr.name}`] = attr.value;
	}
	if (textContent.trim()) result["#text"] = textContent.trim();
	for (const child of elementChildren) {
		const value = elementToJson(child);
		const existing = result[child.tagName];
		if (existing === undefined) {
			result[child.tagName] = value;
		} else if (Array.isArray(existing)) {
			existing.push(value);
		} else {
			result[child.tagName] = [existing, value];
		}
	}
	return result;
}
