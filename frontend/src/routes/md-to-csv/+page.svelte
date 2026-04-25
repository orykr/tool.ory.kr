<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const SAMPLE = `| Name           | Age | Role                |
| -------------- | --- | ------------------- |
| Alice Johnson  | 30  | Engineer            |
| Bob            | 25  | Product Manager     |
| Charlie Smith  | 40  | Lead, Architect     |`;

	let input = $state(SAMPLE);
	let delimiter = $state(",");

	const delimiterLabels: Record<string, string> = {
		",": "Comma (,)",
		";": "Semicolon (;)",
		"\t": "Tab (\\t)",
		"|": "Pipe (|)"
	};

	function splitMarkdownRow(line: string): string[] {
		let trimmed = line.trim();
		if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
		if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
		const cells: string[] = [];
		let cell = "";
		for (let i = 0; i < trimmed.length; i++) {
			const ch = trimmed[i];
			if (ch === "\\" && trimmed[i + 1] === "|") {
				cell += "|";
				i++;
				continue;
			}
			if (ch === "|") {
				cells.push(cell.trim());
				cell = "";
				continue;
			}
			cell += ch;
		}
		cells.push(cell.trim());
		return cells;
	}

	function isSeparatorRow(cells: string[]): boolean {
		return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c.trim()));
	}

	function escapeCsv(value: string, sep: string): string {
		if (value.includes('"') || value.includes(sep) || /[\r\n]/.test(value)) {
			return `"${value.replace(/"/g, '""')}"`;
		}
		return value;
	}

	let output = $derived.by(() => {
		const lines = input.split(/\r?\n/);
		const tableLines = lines.filter((l) => /^\s*\|/.test(l));
		if (tableLines.length === 0) return { ok: false as const, error: "No Markdown table rows detected (lines must start with |)." };
		const rows = tableLines.map(splitMarkdownRow).filter((r) => !isSeparatorRow(r));
		if (rows.length === 0) return { ok: false as const, error: "Only separator row found." };
		const csv = rows.map((r) => r.map((c) => escapeCsv(c, delimiter)).join(delimiter)).join("\n");
		return { ok: true as const, value: csv, rowCount: rows.length };
	});

	let copied = $state(false);
	async function copy() {
		if (!output.ok) return;
		await navigator.clipboard.writeText(output.value);
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
		<h1 class="text-3xl font-bold tracking-tight">Markdown Table → CSV</h1>
		<p class="text-muted-foreground mt-1">
			Convert a Markdown pipe-table into CSV with proper quoting.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="space-y-1.5">
				<Label for="dl">Delimiter</Label>
				<Select.Root type="single" bind:value={delimiter}>
					<Select.Trigger id="dl" class="w-48">{delimiterLabels[delimiter]}</Select.Trigger>
					<Select.Content>
						<Select.Item value=",">Comma (,)</Select.Item>
						<Select.Item value=";">Semicolon (;)</Select.Item>
						<Select.Item value={"\t"}>Tab (\t)</Select.Item>
						<Select.Item value="|">Pipe (|)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Markdown table</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">CSV</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if output.ok}
					<Textarea value={output.value} readonly class="min-h-72 font-mono text-sm" />
					<p class="text-muted-foreground mt-2 text-xs">{output.rowCount} rows</p>
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{output.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
