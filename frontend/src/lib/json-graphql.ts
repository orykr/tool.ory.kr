interface Schema {
	kind: "scalar" | "object" | "list" | "any" | "null" | "union";
	scalar?: "String" | "Int" | "Float" | "Boolean" | "ID";
	properties?: Record<string, Schema>;
	required?: Set<string>;
	itemSchema?: Schema;
	variants?: Schema[];
	hasNull?: boolean;
}

export function inferGraphQL(value: unknown, rootName: string): string {
	const schema = buildSchema(value);
	const collected = new Map<string, Schema>();
	collectObjects(schema, capitalize(rootName) || "Root", collected);
	const blocks: string[] = [];
	for (const [name, s] of collected.entries()) {
		blocks.push(renderObject(name, s, collected));
	}
	return blocks.join("\n\n");
}

function buildSchema(value: unknown): Schema {
	if (value === null) return { kind: "null" };
	if (Array.isArray(value)) {
		if (value.length === 0) return { kind: "list", itemSchema: { kind: "any" } };
		const merged = value.map(buildSchema).reduce((a, b) => mergeSchemas(a, b));
		return { kind: "list", itemSchema: merged };
	}
	const t = typeof value;
	if (t === "string") return { kind: "scalar", scalar: "String" };
	if (t === "boolean") return { kind: "scalar", scalar: "Boolean" };
	if (t === "number") {
		return { kind: "scalar", scalar: Number.isInteger(value) ? "Int" : "Float" };
	}
	if (t === "object") {
		const properties: Record<string, Schema> = {};
		const required = new Set<string>();
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			properties[k] = buildSchema(v);
			required.add(k);
		}
		return { kind: "object", properties, required };
	}
	return { kind: "any" };
}

function mergeSchemas(a: Schema, b: Schema): Schema {
	if (a.kind === "any") return b;
	if (b.kind === "any") return a;
	if (a.kind === "null") return { ...b, hasNull: true };
	if (b.kind === "null") return { ...a, hasNull: true };
	if (a.kind === "scalar" && b.kind === "scalar") {
		if (a.scalar === b.scalar) return a;
		if ((a.scalar === "Int" && b.scalar === "Float") || (a.scalar === "Float" && b.scalar === "Int")) {
			return { kind: "scalar", scalar: "Float" };
		}
	}
	if (a.kind === "list" && b.kind === "list") {
		return { kind: "list", itemSchema: mergeSchemas(a.itemSchema!, b.itemSchema!) };
	}
	if (a.kind === "object" && b.kind === "object") {
		const properties: Record<string, Schema> = {};
		const required = new Set<string>();
		const allKeys = new Set([
			...Object.keys(a.properties ?? {}),
			...Object.keys(b.properties ?? {})
		]);
		for (const k of allKeys) {
			const av = a.properties?.[k];
			const bv = b.properties?.[k];
			if (av && bv) properties[k] = mergeSchemas(av, bv);
			else if (av) properties[k] = av;
			else if (bv) properties[k] = bv;
			if ((a.required?.has(k) ?? false) && (b.required?.has(k) ?? false)) required.add(k);
		}
		return { kind: "object", properties, required };
	}
	return { kind: "union", variants: [a, b] };
}

function collectObjects(schema: Schema, name: string, out: Map<string, Schema>) {
	if (schema.kind === "object") {
		let unique = name;
		let counter = 2;
		while (out.has(unique) && out.get(unique) !== schema) unique = `${name}${counter++}`;
		out.set(unique, schema);
		for (const [k, v] of Object.entries(schema.properties ?? {})) {
			collectObjects(v, capitalize(singularize(k)), out);
		}
	} else if (schema.kind === "list") {
		collectObjects(schema.itemSchema!, name + "Item", out);
	}
}

function renderObject(name: string, schema: Schema, all: Map<string, Schema>): string {
	const lines: string[] = [`type ${safeIdent(name)} {`];
	for (const [key, prop] of Object.entries(schema.properties ?? {})) {
		const required = schema.required?.has(key) ?? false;
		const type = renderType(prop, capitalize(singularize(key)), required, all);
		lines.push(`  ${safeKey(key)}: ${type}`);
	}
	lines.push("}");
	return lines.join("\n");
}

function renderType(schema: Schema, hintName: string, required: boolean, all: Map<string, Schema>): string {
	const baseType = renderBaseType(schema, hintName, all);
	const nonNullable = required && !schema.hasNull && schema.kind !== "null";
	return nonNullable ? `${baseType}!` : baseType;
}

function renderBaseType(schema: Schema, hintName: string, all: Map<string, Schema>): string {
	switch (schema.kind) {
		case "scalar":
			return schema.scalar!;
		case "null":
			return "String";
		case "any":
			return "JSON";
		case "list": {
			const inner = renderBaseType(schema.itemSchema!, hintName + "Item", all);
			const itemNonNull = !schema.itemSchema?.hasNull && schema.itemSchema?.kind !== "null";
			return `[${inner}${itemNonNull ? "!" : ""}]`;
		}
		case "object":
			return safeIdent(hintName);
		case "union":
			return "JSON";
	}
}

function singularize(name: string): string {
	if (name.endsWith("ies")) return name.slice(0, -3) + "y";
	if (name.endsWith("ses")) return name.slice(0, -2);
	if (name.endsWith("s") && !name.endsWith("ss")) return name.slice(0, -1);
	return name;
}

function capitalize(s: string): string {
	if (!s) return s;
	return s[0].toUpperCase() + s.slice(1);
}

function safeIdent(name: string): string {
	const cleaned = name.replace(/[^a-zA-Z0-9_]/g, "_");
	if (/^[0-9]/.test(cleaned)) return "_" + cleaned;
	return cleaned || "T";
}

function safeKey(key: string): string {
	if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) return key;
	return JSON.stringify(key);
}
