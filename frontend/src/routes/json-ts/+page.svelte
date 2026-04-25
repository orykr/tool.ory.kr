<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(`{
  "id": 42,
  "name": "Ada",
  "active": true,
  "tags": ["math", "cs"],
  "address": { "city": "London", "zip": null },
  "scores": [{"subject": "math", "score": 99}]
}`);
	let rootName = $state("Root");

	type TypeNode =
		| { kind: "primitive"; type: string }
		| { kind: "array"; element: TypeNode }
		| { kind: "object"; fields: Map<string, { type: TypeNode; optional: boolean }> }
		| { kind: "union"; members: TypeNode[] };

	function inferNode(value: unknown): TypeNode {
		if (value === null) return { kind: "primitive", type: "null" };
		if (Array.isArray(value)) {
			if (value.length === 0) return { kind: "array", element: { kind: "primitive", type: "unknown" } };
			let element = inferNode(value[0]);
			for (let i = 1; i < value.length; i++) {
				element = unify(element, inferNode(value[i]));
			}
			return { kind: "array", element };
		}
		if (typeof value === "object") {
			const fields = new Map<string, { type: TypeNode; optional: boolean }>();
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				fields.set(k, { type: inferNode(v), optional: false });
			}
			return { kind: "object", fields };
		}
		return { kind: "primitive", type: typeof value };
	}

	function unify(a: TypeNode, b: TypeNode): TypeNode {
		if (sameType(a, b)) return a;
		if (a.kind === "primitive" && a.type === "null") return makeNullable(b);
		if (b.kind === "primitive" && b.type === "null") return makeNullable(a);
		if (a.kind === "object" && b.kind === "object") {
			const merged = new Map<string, { type: TypeNode; optional: boolean }>();
			const allKeys = new Set([...a.fields.keys(), ...b.fields.keys()]);
			for (const k of allKeys) {
				const av = a.fields.get(k);
				const bv = b.fields.get(k);
				if (av && bv) {
					merged.set(k, { type: unify(av.type, bv.type), optional: av.optional || bv.optional });
				} else if (av) {
					merged.set(k, { type: av.type, optional: true });
				} else if (bv) {
					merged.set(k, { type: bv.type, optional: true });
				}
			}
			return { kind: "object", fields: merged };
		}
		if (a.kind === "array" && b.kind === "array") {
			return { kind: "array", element: unify(a.element, b.element) };
		}
		const members = flatten([a, b]);
		const dedupedKeys = new Map<string, TypeNode>();
		for (const m of members) {
			const key = structuralKey(m);
			if (!dedupedKeys.has(key)) dedupedKeys.set(key, m);
		}
		const list = [...dedupedKeys.values()];
		if (list.length === 1) return list[0];
		return { kind: "union", members: list };
	}

	function structuralKey(node: TypeNode): string {
		switch (node.kind) {
			case "primitive":
				return `P:${node.type}`;
			case "array":
				return `A:${structuralKey(node.element)}`;
			case "object": {
				const keys = [...node.fields.keys()].sort();
				const parts = keys.map((k) => {
					const f = node.fields.get(k)!;
					return `${k}${f.optional ? "?" : ""}=${structuralKey(f.type)}`;
				});
				return `O:{${parts.join(",")}}`;
			}
			case "union": {
				const sorted = [...new Set(node.members.map(structuralKey))].sort();
				return `U:[${sorted.join("|")}]`;
			}
		}
	}

	function flatten(nodes: TypeNode[]): TypeNode[] {
		const out: TypeNode[] = [];
		for (const n of nodes) {
			if (n.kind === "union") out.push(...flatten(n.members));
			else out.push(n);
		}
		return out;
	}

	function makeNullable(node: TypeNode): TypeNode {
		if (node.kind === "union") {
			if (node.members.some((m) => m.kind === "primitive" && m.type === "null")) return node;
			return { kind: "union", members: [...node.members, { kind: "primitive", type: "null" }] };
		}
		if (node.kind === "primitive" && node.type === "null") return node;
		return { kind: "union", members: [node, { kind: "primitive", type: "null" }] };
	}

	function sameType(a: TypeNode, b: TypeNode): boolean {
		return structuralKey(a) === structuralKey(b);
	}

	function isValidIdent(name: string): boolean {
		return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
	}

	function pascalCase(name: string): string {
		const cleaned = name.replace(/[^A-Za-z0-9]+/g, " ").trim();
		if (!cleaned) return "T";
		const parts = cleaned.split(/\s+/);
		const result = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
		return /^[0-9]/.test(result) ? "_" + result : result;
	}

	function renderType(node: TypeNode, hint: string, declarations: string[]): string {
		switch (node.kind) {
			case "primitive": {
				const map: Record<string, string> = {
					string: "string",
					number: "number",
					boolean: "boolean",
					null: "null",
					unknown: "unknown"
				};
				return map[node.type] ?? "unknown";
			}
			case "array":
				return `${renderType(node.element, hint + "Item", declarations)}[]`;
			case "object": {
				const lines: string[] = [];
				for (const [k, info] of node.fields) {
					const childHint = pascalCase(hint + " " + k);
					const t = renderType(info.type, childHint, declarations);
					const key = isValidIdent(k) ? k : JSON.stringify(k);
					lines.push(`  ${key}${info.optional ? "?" : ""}: ${t};`);
				}
				const body = lines.length ? `{\n${lines.join("\n")}\n}` : "{}";
				const name = pascalCase(hint);
				declarations.push(`export interface ${name} ${body}`);
				return name;
			}
			case "union": {
				const parts = node.members.map((m, i) => {
					const memberHint = m.kind === "object" ? `${hint}Variant${i + 1}` : hint;
					return renderType(m, memberHint, declarations);
				});
				return [...new Set(parts)].join(" | ");
			}
		}
	}

	let output = $derived.by(() => {
		try {
			if (!input.trim()) return { ok: true as const, value: "" };
			const parsed = JSON.parse(input);
			const root = inferNode(parsed);
			const declarations: string[] = [];
			const rootRendered = renderType(root, rootName || "Root", declarations);
			let final = declarations.join("\n\n");
			if (root.kind !== "object") {
				const name = pascalCase(rootName || "Root");
				final = `export type ${name} = ${rootRendered};`;
			}
			return { ok: true as const, value: final };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		if (!output.ok || !output.value) return;
		await navigator.clipboard.writeText(output.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">JSON → TypeScript</h1>
		<p class="text-muted-foreground mt-1">
			Infer TypeScript interfaces from a JSON sample. Arrays merge element shapes; missing keys become optional.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5 sm:col-span-2">
				<Label for="rn">Root interface name</Label>
				<Input id="rn" bind:value={rootName} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">TypeScript</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok || !output.value}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if output.ok}
					<Textarea value={output.value} readonly class="min-h-96 font-mono text-sm" />
				{:else}
					<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
						{output.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
