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
  "scores": [{"subject": "math", "score": 99.5}]
}`);
	let rootName = $state("Root");

	type TypeNode =
		| { kind: "primitive"; type: "bool" | "string" | "int" | "float64" | "interface" }
		| { kind: "array"; element: TypeNode }
		| { kind: "object"; fields: Map<string, TypeNode> };

	function exportName(name: string): string {
		const cleaned = name.replace(/[^A-Za-z0-9]+/g, " ").trim();
		if (!cleaned) return "Field";
		const parts = cleaned.split(/\s+/);
		const result = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
		return /^[0-9]/.test(result) ? "_" + result : result;
	}

	function uniqueName(base: string, used: Set<string>): string {
		if (!used.has(base)) {
			used.add(base);
			return base;
		}
		let i = 2;
		while (used.has(`${base}${i}`)) i++;
		const next = `${base}${i}`;
		used.add(next);
		return next;
	}

	function inferNode(value: unknown): TypeNode {
		if (value === null) return { kind: "primitive", type: "interface" };
		if (Array.isArray(value)) {
			if (value.length === 0) return { kind: "array", element: { kind: "primitive", type: "interface" } };
			let elem = inferNode(value[0]);
			for (let i = 1; i < value.length; i++) elem = unifyNode(elem, inferNode(value[i]));
			return { kind: "array", element: elem };
		}
		switch (typeof value) {
			case "boolean":
				return { kind: "primitive", type: "bool" };
			case "string":
				return { kind: "primitive", type: "string" };
			case "number":
				return { kind: "primitive", type: Number.isInteger(value as number) ? "int" : "float64" };
			case "object": {
				const fields = new Map<string, TypeNode>();
				for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
					fields.set(k, inferNode(v));
				}
				return { kind: "object", fields };
			}
			default:
				return { kind: "primitive", type: "interface" };
		}
	}

	function unifyNode(a: TypeNode, b: TypeNode): TypeNode {
		if (a.kind === "primitive" && a.type === "interface") return b.kind === "primitive" && b.type === "interface" ? a : b;
		if (b.kind === "primitive" && b.type === "interface") return a;
		if (a.kind === "primitive" && b.kind === "primitive") {
			if (a.type === b.type) return a;
			if ((a.type === "int" && b.type === "float64") || (a.type === "float64" && b.type === "int")) {
				return { kind: "primitive", type: "float64" };
			}
			return { kind: "primitive", type: "interface" };
		}
		if (a.kind === "array" && b.kind === "array") {
			return { kind: "array", element: unifyNode(a.element, b.element) };
		}
		if (a.kind === "object" && b.kind === "object") {
			const merged = new Map<string, TypeNode>();
			const allKeys = new Set([...a.fields.keys(), ...b.fields.keys()]);
			for (const k of allKeys) {
				const av = a.fields.get(k);
				const bv = b.fields.get(k);
				if (av && bv) merged.set(k, unifyNode(av, bv));
				else merged.set(k, av ?? bv ?? { kind: "primitive", type: "interface" });
			}
			return { kind: "object", fields: merged };
		}
		return { kind: "primitive", type: "interface" };
	}

	function escapeTagValue(s: string): string {
		return s.replace(/`/g, "");
	}

	function renderType(node: TypeNode, hint: string, decls: Map<string, string>, used: Set<string>): string {
		switch (node.kind) {
			case "primitive":
				return node.type === "interface" ? "interface{}" : node.type;
			case "array":
				return `[]${renderType(node.element, hint + "Item", decls, used)}`;
			case "object": {
				const usedFieldNames = new Set<string>();
				const lines: string[] = [];
				const name = uniqueName(exportName(hint), used);
				lines.push(`type ${name} struct {`);
				for (const [k, v] of node.fields) {
					const childHint = `${hint} ${k}`;
					const childType = renderType(v, childHint, decls, used);
					let goName = exportName(k);
					while (usedFieldNames.has(goName)) goName = goName + "_";
					usedFieldNames.add(goName);
					lines.push(`\t${goName} ${childType} \`json:"${escapeTagValue(k)}"\``);
				}
				lines.push("}");
				decls.set(name, lines.join("\n"));
				return name;
			}
		}
	}

	let output = $derived.by(() => {
		try {
			if (!input.trim()) return { ok: true as const, value: "" };
			const parsed = JSON.parse(input);
			const root = inferNode(parsed);
			const decls = new Map<string, string>();
			const used = new Set<string>();
			const rootHint = rootName || "Root";
			const rootType = renderType(root, rootHint, decls, used);
			let final = "";
			if (root.kind !== "object") {
				const name = uniqueName(exportName(rootHint), used);
				final = `type ${name} ${rootType}`;
			} else {
				final = [...decls.values()].join("\n\n");
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
		<h1 class="text-3xl font-bold tracking-tight">JSON → Go struct</h1>
		<p class="text-muted-foreground mt-1">
			Generate Go struct definitions with <code>json</code> tags from a JSON sample.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5 sm:col-span-2">
				<Label for="rn">Root struct name</Label>
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
				<Card.Title class="text-base">Go</Card.Title>
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
