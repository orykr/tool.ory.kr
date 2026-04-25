<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(`<table>
  <thead>
    <tr><th>Name</th><th>Age</th><th>Role</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>30</td><td>Engineer</td></tr>
    <tr><td>Bob</td><td>25</td><td>PM</td></tr>
    <tr><td>Charlie</td><td>40</td><td>Architect</td></tr>
  </tbody>
</table>`);

	function directChildren<T extends Element>(parent: Element, selector: string): T[] {
		return Array.from(parent.children).filter((c) => c.matches(selector)) as T[];
	}

	function rowsOf(parent: Element): Element[] {
		return directChildren<Element>(parent, "tr");
	}

	function cellsOf(row: Element): string[] {
		return directChildren<Element>(row, "th, td").map((c) => (c.textContent ?? "").trim());
	}

	function extractTables(html: string): { headers: string[]; rows: string[][] }[] {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");
		const allTables = Array.from(doc.querySelectorAll("table"));
		const topTables = allTables.filter((t) => !t.parentElement?.closest("table"));
		const tables: { headers: string[]; rows: string[][] }[] = [];
		for (const table of topTables) {
			const thead = directChildren<Element>(table, "thead")[0];
			const tbody = directChildren<Element>(table, "tbody")[0];
			let headers: string[] = [];
			let bodyRows: Element[] = [];
			if (thead) {
				const headRow = rowsOf(thead)[0];
				if (headRow) headers = cellsOf(headRow);
				if (tbody) bodyRows = rowsOf(tbody);
				else bodyRows = rowsOf(table).filter((r) => r.parentElement === table);
			} else {
				const directRows = rowsOf(tbody ?? table);
				const firstRow = directRows[0];
				if (firstRow) {
					const onlyTh = directChildren<Element>(firstRow, "th, td").every((c) => c.tagName.toLowerCase() === "th");
					if (onlyTh && directChildren<Element>(firstRow, "th").length > 0) {
						headers = cellsOf(firstRow);
						bodyRows = directRows.slice(1);
					} else {
						bodyRows = directRows;
					}
				}
			}
			const rows = bodyRows.map(cellsOf);
			tables.push({ headers, rows });
		}
		return tables;
	}

	function uniqueHeaders(headers: string[]): string[] {
		const seen = new Map<string, number>();
		return headers.map((h) => {
			const count = seen.get(h) ?? 0;
			seen.set(h, count + 1);
			return count === 0 ? h : `${h}_${count + 1}`;
		});
	}

	let result = $derived.by(() => {
		try {
			const tables = extractTables(input);
			if (tables.length === 0) return { ok: false as const, error: "No <table> elements found." };
			const objects = tables.map((t) => {
				const baseHeaders = t.headers.length
					? t.headers.map((h, i) => h || `col${i + 1}`)
					: [];
				const headers = uniqueHeaders(baseHeaders);
				return t.rows.map((r) => {
					const obj: Record<string, string> = {};
					for (let i = 0; i < r.length; i++) {
						const key = headers[i] ?? `col${i + 1}`;
						obj[key] = r[i];
					}
					return obj;
				});
			});
			const value = objects.length === 1 ? objects[0] : objects;
			return {
				ok: true as const,
				json: JSON.stringify(value, null, 2),
				count: tables.length,
				totalRows: tables.reduce((s, t) => s + t.rows.length, 0)
			};
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		if (!result.ok) return;
		await navigator.clipboard.writeText(result.json);
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
		<h1 class="text-3xl font-bold tracking-tight">HTML Table → JSON</h1>
		<p class="text-muted-foreground mt-1">
			Extract <code>&lt;table&gt;</code> rows as JSON objects. The first row (or <code>&lt;thead&gt;</code>) becomes the keys.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">HTML</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">JSON</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!result.ok}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if result.ok}
					<Textarea value={result.json} readonly class="min-h-96 font-mono text-sm" />
					<p class="text-muted-foreground mt-2 text-xs">{result.count} tables · {result.totalRows} rows</p>
				{:else}
					<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
						{result.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
