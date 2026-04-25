<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { parseCsv } from "$lib/csv";

	let csv = $state("name,age,city\nAlice,30,Seoul\nBob,25,\"New York\"\nCharlie,40,Tokyo");
	let table = $state("users");
	let dialect = $state<"standard" | "mysql" | "postgres" | "sqlite">("standard");
	let mode = $state<"single" | "batch">("batch");
	let inferTypes = $state(true);

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: parseCsv(csv) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	function quoteIdent(name: string): string {
		if (dialect === "mysql") return `\`${name.replace(/`/g, "``")}\``;
		return `"${name.replace(/"/g, '""')}"`;
	}

	function formatValue(value: string): string {
		if (value === "") return "NULL";
		if (inferTypes) {
			if (/^-?\d+$/.test(value)) return value;
			if (/^-?\d*\.\d+$/.test(value)) return value;
			if (/^(true|false)$/i.test(value)) return value.toLowerCase();
			if (/^null$/i.test(value)) return "NULL";
		}
		return `'${value.replace(/'/g, "''")}'`;
	}

	let output = $derived.by(() => {
		if (!parsed.ok) return "";
		const { headers, rows } = parsed.data;
		if (headers.length === 0 || rows.length === 0) return "";
		const cols = headers.map(quoteIdent).join(", ");
		const tableName = quoteIdent(table);

		if (mode === "single") {
			const valuesList = rows
				.map((row) => `  (${headers.map((_, i) => formatValue(row[i] ?? "")).join(", ")})`)
				.join(",\n");
			return `INSERT INTO ${tableName} (${cols})\nVALUES\n${valuesList};`;
		}
		return rows
			.map(
				(row) =>
					`INSERT INTO ${tableName} (${cols}) VALUES (${headers
						.map((_, i) => formatValue(row[i] ?? ""))
						.join(", ")});`
			)
			.join("\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">CSV → SQL INSERT</h1>
		<p class="text-muted-foreground mt-1">
			Convert CSV rows into SQL <code>INSERT</code> statements with proper escaping.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="tbl">Table name</Label>
				<Input id="tbl" bind:value={table} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="dl">Dialect</Label>
				<Select.Root type="single" bind:value={dialect as never}>
					<Select.Trigger id="dl" class="w-full">{dialect}</Select.Trigger>
					<Select.Content>
						<Select.Item value="standard">Standard SQL</Select.Item>
						<Select.Item value="mysql">MySQL</Select.Item>
						<Select.Item value="postgres">PostgreSQL</Select.Item>
						<Select.Item value="sqlite">SQLite</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="md">Mode</Label>
				<Select.Root type="single" bind:value={mode as never}>
					<Select.Trigger id="md" class="w-full">{mode}</Select.Trigger>
					<Select.Content>
						<Select.Item value="batch">Batch (multi-row INSERT)</Select.Item>
						<Select.Item value="single">One INSERT per row</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 sm:col-span-3 text-sm">
				<input type="checkbox" bind:checked={inferTypes} class="h-4 w-4 rounded border" />
				Infer numbers/booleans/null instead of quoting all values
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">CSV input</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={csv} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">SQL</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	{#if parsed.ok === false}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{/if}
</main>
