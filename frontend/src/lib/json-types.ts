export type Style = "interface" | "type" | "zod";

export interface InferOptions {
	rootName: string;
	style: Style;
	optionalNullable: boolean;
}

interface Schema {
	kind: "primitive" | "object" | "array" | "union" | "any" | "null";
	primitive?: "string" | "number" | "boolean";
	properties?: Record<string, Schema>;
	required?: Set<string>;
	itemSchema?: Schema;
	variants?: Schema[];
	hasNull?: boolean;
}

export function inferTypes(value: unknown, opts: InferOptions): string {
	const schema = buildSchema(value);
	const collected = new Map<string, Schema>();
	collectObjects(schema, opts.rootName, collected);
	const seen = new Set<string>();
	const blocks: string[] = [];
	for (const [name, s] of collected.entries()) {
		blocks.push(renderObject(name, s, opts, collected, seen));
	}
	return blocks.join("\n\n");
}

function buildSchema(value: unknown): Schema {
	if (value === null) return { kind: "null" };
	if (Array.isArray(value)) {
		if (value.length === 0) return { kind: "array", itemSchema: { kind: "any" } };
		const itemSchemas = value.map(buildSchema);
		const merged = itemSchemas.reduce((acc, s) => mergeSchemas(acc, s));
		return { kind: "array", itemSchema: merged };
	}
	const t = typeof value;
	if (t === "string" || t === "number" || t === "boolean") {
		return { kind: "primitive", primitive: t };
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
	if (a.kind === "primitive" && b.kind === "primitive" && a.primitive === b.primitive) {
		return { ...a, hasNull: a.hasNull || b.hasNull };
	}
	if (a.kind === "array" && b.kind === "array") {
		return {
			kind: "array",
			itemSchema: mergeSchemas(a.itemSchema!, b.itemSchema!),
			hasNull: a.hasNull || b.hasNull
		};
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
		return { kind: "object", properties, required, hasNull: a.hasNull || b.hasNull };
	}
	const variants = [a, b].flatMap((s) => (s.kind === "union" ? s.variants ?? [] : [s]));
	return { kind: "union", variants };
}

function collectObjects(schema: Schema, name: string, out: Map<string, Schema>) {
	if (schema.kind === "object") {
		out.set(name, schema);
		for (const [k, v] of Object.entries(schema.properties ?? {})) {
			collectObjects(v, capitalize(singularize(k)), out);
		}
	} else if (schema.kind === "array") {
		collectObjects(schema.itemSchema!, name + "Item", out);
	} else if (schema.kind === "union") {
		for (const v of schema.variants ?? []) collectObjects(v, name, out);
	}
}

function renderObject(
	name: string,
	schema: Schema,
	opts: InferOptions,
	all: Map<string, Schema>,
	seen: Set<string>
): string {
	if (seen.has(name)) return "";
	seen.add(name);
	const lines: string[] = [];
	const keyword = opts.style === "interface" ? `interface ${safeIdent(name)} ` : opts.style === "type" ? `type ${safeIdent(name)} = ` : `const ${safeIdent(name).toLowerCase()}Schema = z.object(`;
	const open = opts.style === "zod" ? "{" : "{";
	lines.push(`${keyword}${open}`);
	const indent = "\t";
	for (const [key, prop] of Object.entries(schema.properties ?? {})) {
		const optional =
			opts.optionalNullable && (prop.hasNull || !schema.required?.has(key));
		const typeStr = renderType(prop, capitalize(singularize(key)), opts, all);
		if (opts.style === "zod") {
			let line = `${indent}${safeKey(key)}: ${zodFromSchema(prop, capitalize(singularize(key)))}`;
			if (optional) line += ".optional()";
			lines.push(line + ",");
		} else {
			const opt = optional ? "?" : "";
			lines.push(`${indent}${safeKey(key)}${opt}: ${typeStr};`);
		}
	}
	if (opts.style === "zod") lines.push("});");
	else if (opts.style === "type") lines.push("};");
	else lines.push("}");
	return lines.join("\n");
}

function renderType(schema: Schema, hintName: string, opts: InferOptions, all: Map<string, Schema>): string {
	let base: string;
	switch (schema.kind) {
		case "primitive":
			base = schema.primitive!;
			break;
		case "null":
			base = "null";
			break;
		case "any":
			base = "unknown";
			break;
		case "array":
			base = `${renderType(schema.itemSchema!, hintName + "Item", opts, all)}[]`;
			break;
		case "object":
			base = safeIdent(hintName);
			break;
		case "union":
			base = (schema.variants ?? [])
				.map((v) => renderType(v, hintName, opts, all))
				.join(" | ");
			break;
	}
	if (schema.hasNull && schema.kind !== "null" && !base.includes("null")) base += " | null";
	return base;
}

function zodFromSchema(schema: Schema, hintName: string): string {
	let base: string;
	switch (schema.kind) {
		case "primitive":
			base = `z.${schema.primitive}()`;
			break;
		case "null":
			base = "z.null()";
			break;
		case "any":
			base = "z.unknown()";
			break;
		case "array":
			base = `z.array(${zodFromSchema(schema.itemSchema!, hintName + "Item")})`;
			break;
		case "object":
			base = safeIdent(hintName).charAt(0).toLowerCase() + safeIdent(hintName).slice(1) + "Schema";
			break;
		case "union":
			base = `z.union([${(schema.variants ?? []).map((v) => zodFromSchema(v, hintName)).join(", ")}])`;
			break;
	}
	if (schema.hasNull && schema.kind !== "null") base += ".nullable()";
	return base;
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
	if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return key;
	return JSON.stringify(key);
}
