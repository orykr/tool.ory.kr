type SchemaNode = Record<string, unknown>;

export interface SchemaOptions {
	title: string;
	requireAll: boolean;
	includeExamples: boolean;
}

export function inferJsonSchema(value: unknown, opts: SchemaOptions): SchemaNode {
	const schema = build(value, opts);
	return {
		$schema: "https://json-schema.org/draft/2020-12/schema",
		title: opts.title || "Root",
		...schema
	};
}

function build(value: unknown, opts: SchemaOptions): SchemaNode {
	if (value === null) return { type: "null" };
	if (Array.isArray(value)) {
		if (value.length === 0) return { type: "array", items: {} };
		const itemSchemas = value.map((v) => build(v, opts));
		const merged = itemSchemas.reduce((a, b) => mergeSchema(a, b));
		return {
			type: "array",
			items: merged,
			...(opts.includeExamples && { examples: [value] })
		};
	}
	if (typeof value === "object") {
		const properties: Record<string, SchemaNode> = {};
		const required: string[] = [];
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			properties[k] = build(v, opts);
			required.push(k);
		}
		const node: SchemaNode = { type: "object", properties };
		if (opts.requireAll && required.length) node.required = required;
		return node;
	}
	if (typeof value === "string") {
		const schema: SchemaNode = { type: "string" };
		const fmt = detectStringFormat(value);
		if (fmt) schema.format = fmt;
		if (opts.includeExamples) schema.examples = [value];
		return schema;
	}
	if (typeof value === "number") {
		return {
			type: Number.isInteger(value) ? "integer" : "number",
			...(opts.includeExamples && { examples: [value] })
		};
	}
	if (typeof value === "boolean") {
		return { type: "boolean", ...(opts.includeExamples && { examples: [value] }) };
	}
	return {};
}

function detectStringFormat(value: string): string | null {
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return "date-time";
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
	if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return "time";
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "email";
	if (/^https?:\/\//.test(value)) return "uri";
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return "uuid";
	if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return "ipv4";
	return null;
}

function mergeSchema(a: SchemaNode, b: SchemaNode): SchemaNode {
	if (a.type === b.type) {
		if (a.type === "object") {
			const aProps = (a.properties as Record<string, SchemaNode>) ?? {};
			const bProps = (b.properties as Record<string, SchemaNode>) ?? {};
			const properties: Record<string, SchemaNode> = {};
			const allKeys = new Set([...Object.keys(aProps), ...Object.keys(bProps)]);
			const required: string[] = [];
			const aReq = (a.required as string[]) ?? [];
			const bReq = (b.required as string[]) ?? [];
			for (const k of allKeys) {
				if (aProps[k] && bProps[k]) properties[k] = mergeSchema(aProps[k], bProps[k]);
				else if (aProps[k]) properties[k] = aProps[k];
				else properties[k] = bProps[k];
				if (aReq.includes(k) && bReq.includes(k)) required.push(k);
			}
			const node: SchemaNode = { type: "object", properties };
			if (required.length) node.required = required;
			return node;
		}
		if (a.type === "array") {
			return {
				type: "array",
				items: mergeSchema((a.items as SchemaNode) ?? {}, (b.items as SchemaNode) ?? {})
			};
		}
		return a;
	}
	const collect = (s: SchemaNode): SchemaNode[] => {
		if (Array.isArray(s.anyOf)) return s.anyOf as SchemaNode[];
		return [s];
	};
	const merged = [...collect(a), ...collect(b)];
	const seen = new Set<string>();
	const unique: SchemaNode[] = [];
	for (const m of merged) {
		const key = JSON.stringify(m);
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(m);
		}
	}
	return { anyOf: unique };
}
