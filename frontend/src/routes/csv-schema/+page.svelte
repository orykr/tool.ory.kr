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

	let csv = $state(`id,name,email,age,joined,active,balance
1,Alice,alice@example.com,30,2024-01-12,true,1234.56
2,Bob,bob@example.com,25,2024-03-04T08:30:00Z,false,0
3,Charlie,charlie@example.com,40,2025-02-01,true,789.0`);

	let table = $state("users");
	let dialect = $state<"postgres" | "mysql" | "sqlite" | "mssql">("postgres");
	let firstColPK = $state(true);

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: parseCsv(csv) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	type ColType = "INTEGER" | "BIGINT" | "DECIMAL" | "BOOLEAN" | "DATE" | "TIMESTAMP" | "TEXT";

	function inferType(values: string[]): ColType {
		const nonEmpty = values.filter((v) => v.length > 0);
		if (nonEmpty.length === 0) return "TEXT";

		if (nonEmpty.every((v) => /^(true|false)$/i.test(v))) return "BOOLEAN";
		if (nonEmpty.every((v) => /^-?\d+$/.test(v))) {
			const allFit = nonEmpty.every((v) => {
				const n = BigInt(v);
				return n >= -2147483648n && n <= 2147483647n;
			});
			return allFit ? "INTEGER" : "BIGINT";
		}
		if (nonEmpty.every((v) => /^-?\d+\.\d+$/.test(v) || /^-?\d+$/.test(v))) return "DECIMAL";
		if (nonEmpty.every((v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v))) return "TIMESTAMP";
		if (nonEmpty.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))) return "DATE";
		return "TEXT";
	}

	function maxLen(values: string[]): number {
		return values.reduce((m, v) => Math.max(m, v.length), 0);
	}

	function dialectType(t: ColType, max: number): string {
		switch (dialect) {
			case "postgres":
				if (t === "BOOLEAN") return "BOOLEAN";
				if (t === "INTEGER") return "INTEGER";
				if (t === "BIGINT") return "BIGINT";
				if (t === "DECIMAL") return "NUMERIC";
				if (t === "DATE") return "DATE";
				if (t === "TIMESTAMP") return "TIMESTAMPTZ";
				return max <= 255 ? `VARCHAR(${Math.max(1, max)})` : "TEXT";
			case "mysql":
				if (t === "BOOLEAN") return "TINYINT(1)";
				if (t === "INTEGER") return "INT";
				if (t === "BIGINT") return "BIGINT";
				if (t === "DECIMAL") return "DECIMAL(18,4)";
				if (t === "DATE") return "DATE";
				if (t === "TIMESTAMP") return "DATETIME";
				return max <= 255 ? `VARCHAR(${Math.max(1, max)})` : "TEXT";
			case "sqlite":
				if (t === "BOOLEAN") return "INTEGER";
				if (t === "INTEGER" || t === "BIGINT") return "INTEGER";
				if (t === "DECIMAL") return "REAL";
				return "TEXT";
			case "mssql":
				if (t === "BOOLEAN") return "BIT";
				if (t === "INTEGER") return "INT";
				if (t === "BIGINT") return "BIGINT";
				if (t === "DECIMAL") return "DECIMAL(18,4)";
				if (t === "DATE") return "DATE";
				if (t === "TIMESTAMP") return "DATETIME2";
				return max <= 4000 ? `NVARCHAR(${Math.max(1, max)})` : "NVARCHAR(MAX)";
		}
	}

	function quoteIdent(name: string): string {
		if (dialect === "mysql") return `\`${name.replace(/`/g, "``")}\``;
		if (dialect === "mssql") return `[${name.replace(/]/g, "]]")}]`;
		return `"${name.replace(/"/g, '""')}"`;
	}

	let schema = $derived.by(() => {
		if (!parsed.ok) return "";
		const { headers, rows } = parsed.data;
		if (headers.length === 0) return "";
		const cols = headers.map((h, i) => {
			const values = rows.map((r) => r[i] ?? "");
			const t = inferType(values);
			const ml = maxLen(values);
			const sqlType = dialectType(t, ml);
			const hasEmpty = values.some((v) => v === "");
			const nullable = hasEmpty ? "" : " NOT NULL";
			const pk = firstColPK && i === 0 ? " PRIMARY KEY" : "";
			return `  ${quoteIdent(h)} ${sqlType}${nullable}${pk}`;
		});
		return `CREATE TABLE ${quoteIdent(table)} (\n${cols.join(",\n")}\n);`;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(schema);
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
		<h1 class="text-3xl font-bold tracking-tight">CSV → SQL Schema</h1>
		<p class="text-muted-foreground mt-1">
			Infer a CREATE TABLE statement from a CSV by detecting column types.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="tbl">Table</Label>
				<Input id="tbl" bind:value={table} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="dl">Dialect</Label>
				<Select.Root type="single" bind:value={dialect as never}>
					<Select.Trigger id="dl" class="w-full">{dialect}</Select.Trigger>
					<Select.Content>
						<Select.Item value="postgres">PostgreSQL</Select.Item>
						<Select.Item value="mysql">MySQL</Select.Item>
						<Select.Item value="sqlite">SQLite</Select.Item>
						<Select.Item value="mssql">SQL Server</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 pt-6 text-sm">
				<input type="checkbox" bind:checked={firstColPK} class="h-4 w-4 rounded border" />
				Make first column PRIMARY KEY
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
				<Card.Title class="text-base">CREATE TABLE</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!schema}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={schema} readonly class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	{#if !parsed.ok}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{/if}
</main>
