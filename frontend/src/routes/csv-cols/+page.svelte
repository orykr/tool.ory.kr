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

	let csv = $state(`id,name,email,country,active,joined
1,Alice,alice@example.com,KR,true,2024-01-12
2,Bob,bob@example.com,JP,false,2024-03-04
3,Charlie,charlie@example.com,US,true,2024-08-22
4,Dana,dana@example.com,DE,true,2025-02-01`);

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: parseCsv(csv) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let selected = $state<Set<string>>(new Set());
	let lastHeaders = $state<string[]>([]);

	$effect(() => {
		if (!parsed.ok) return;
		const headers = parsed.data.headers;
		if (JSON.stringify(headers) !== JSON.stringify(lastHeaders)) {
			selected = new Set(headers);
			lastHeaders = headers;
		}
	});

	let filterColumn = $state<string>("");
	let filterValue = $state("");
	let exact = $state(false);

	let output = $derived.by(() => {
		if (!parsed.ok) return "";
		const { headers, rows } = parsed.data;
		if (headers.length === 0) return "";
		const selectedIndices = headers
			.map((h, i) => ({ h, i }))
			.filter(({ h }) => selected.has(h));
		if (selectedIndices.length === 0) return "";
		const filterIdx = filterColumn ? headers.indexOf(filterColumn) : -1;
		const fv = filterValue.toLowerCase();
		const filteredRows = rows.filter((row) => {
			if (filterIdx < 0 || !fv) return true;
			const cell = (row[filterIdx] ?? "").toLowerCase();
			return exact ? cell === fv : cell.includes(fv);
		});
		const headerLine = selectedIndices.map(({ h }) => quoteIfNeeded(h)).join(",");
		const lines = filteredRows.map((row) =>
			selectedIndices.map(({ i }) => quoteIfNeeded(row[i] ?? "")).join(",")
		);
		return [headerLine, ...lines].join("\n");
	});

	function quoteIfNeeded(value: string): string {
		if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
		return value;
	}

	function toggle(header: string) {
		const next = new Set(selected);
		if (next.has(header)) next.delete(header);
		else next.add(header);
		selected = next;
	}

	function selectAll() {
		if (parsed.ok) selected = new Set(parsed.data.headers);
	}

	function selectNone() {
		selected = new Set();
	}

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">CSV Column Extractor</h1>
		<p class="text-muted-foreground mt-1">
			Pick columns and filter rows from a CSV. Output is also CSV.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">CSV input</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={csv} class="min-h-40 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	{#if parsed.ok && parsed.data.headers.length}
		<Card.Root class="mb-4">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Columns</Card.Title>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={selectAll}>All</Button>
					<Button variant="outline" size="sm" onclick={selectNone}>None</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
					{#each parsed.data.headers as h, i (i + h)}
						<label class="flex cursor-pointer items-center gap-2 rounded border p-2 text-sm">
							<input
								type="checkbox"
								checked={selected.has(h)}
								onchange={() => toggle(h)}
								class="h-4 w-4 rounded border"
							/>
							<span class="font-mono">{h}</span>
						</label>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mb-4">
			<Card.Header><Card.Title class="text-base">Filter</Card.Title></Card.Header>
			<Card.Content class="grid gap-3 sm:grid-cols-3">
				<div class="space-y-1.5">
					<Label for="fc">Column</Label>
					<Select.Root type="single" bind:value={filterColumn}>
						<Select.Trigger id="fc" class="w-full">{filterColumn || "(none)"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="">(none)</Select.Item>
							{#each parsed.data.headers as h, i (i + h)}
								<Select.Item value={h}>{h}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5 sm:col-span-2">
					<Label for="fv">Value (case-insensitive)</Label>
					<Input id="fv" bind:value={filterValue} class="font-mono" />
				</div>
				<label class="flex cursor-pointer items-center gap-2 sm:col-span-3 text-sm">
					<input type="checkbox" bind:checked={exact} class="h-4 w-4 rounded border" />
					Exact match (rather than contains)
				</label>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Output</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	{/if}

	{#if !parsed.ok}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{/if}
</main>
