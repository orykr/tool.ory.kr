export function jsonToXml(value: unknown, rootName = "root"): string {
	return `<?xml version="1.0" encoding="UTF-8"?>\n${render(rootName, value, 0)}`;
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
		const inner = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => render(escapeName(k), v, depth + 1))
			.join("\n");
		if (!inner) return `${indent}<${tag}/>`;
		return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`;
	}
	return `${indent}<${tag}>${escapeXml(String(value))}</${tag}>`;
}

function singularize(name: string): string {
	if (name.endsWith("ies")) return name.slice(0, -3) + "y";
	if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
	return "item";
}

function escapeName(name: string): string {
	return name.replace(/[^a-zA-Z0-9_]/g, "_") || "item";
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
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
	const children = Array.from(element.children);
	if (children.length === 0) {
		const text = element.textContent ?? "";
		if (element.attributes.length === 0) return text || null;
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
	for (const child of children) {
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
