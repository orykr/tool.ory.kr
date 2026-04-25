<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { csvToJson, jsonToCsv, parseCsv } from "$lib/csv";

	let csvInput = $state("name,age,city\nAlice,30,Seoul\nBob,25,Tokyo\n\"Charlie, Jr.\",40,\"New York\"");
	let jsonOutput = $state("");
	let csvError = $state<string | null>(null);

	let jsonInput = $state(
		'[{"name":"Alice","age":30,"city":"Seoul"},{"name":"Bob","age":25,"city":"Tokyo"}]'
	);
	let csvOutput = $state("");
	let jsonError = $state<string | null>(null);

	let delimiter = $state(",");
	const delimiterLabels: Record<string, string> = {
		",": "Comma (,)",
		";": "Semicolon (;)",
		"\t": "Tab (\\t)",
		"|": "Pipe (|)"
	};

	$effect(() => {
		void csvInput;
		void delimiter;
		try {
			if (!csvInput.trim()) {
				jsonOutput = "";
				csvError = null;
				return;
			}
			const data = csvToJson(csvInput, delimiter);
			jsonOutput = JSON.stringify(data, null, 2);
			csvError = null;
		} catch (e) {
			jsonOutput = "";
			csvError = (e as Error).message;
		}
	});

	$effect(() => {
		void jsonInput;
		void delimiter;
		try {
			if (!jsonInput.trim()) {
				csvOutput = "";
				jsonError = null;
				return;
			}
			const parsed = JSON.parse(jsonInput);
			csvOutput = jsonToCsv(parsed, delimiter);
			jsonError = null;
		} catch (e) {
			csvOutput = "";
			jsonError = (e as Error).message;
		}
	});

	let preview = $derived.by(() => {
		try {
			return parseCsv(csvInput, delimiter);
		} catch {
			return null;
		}
	});

	let copiedKey = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copiedKey = key;
		setTimeout(() => (copiedKey = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">CSV ↔ JSON Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between CSV and JSON with quote-aware parsing.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex items-center gap-3 pt-6">
			<Label for="delim">Delimiter</Label>
			<Select.Root type="single" bind:value={delimiter}>
				<Select.Trigger id="delim" class="w-48">{delimiterLabels[delimiter]}</Select.Trigger>
				<Select.Content>
					<Select.Item value=",">Comma (,)</Select.Item>
					<Select.Item value=";">Semicolon (;)</Select.Item>
					<Select.Item value={"\t"}>Tab (\t)</Select.Item>
					<Select.Item value="|">Pipe (|)</Select.Item>
				</Select.Content>
			</Select.Root>
		</Card.Content>
	</Card.Root>

	<Tabs.Root value="csv2json" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="csv2json">CSV → JSON</Tabs.Trigger>
			<Tabs.Trigger value="json2csv">JSON → CSV</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="csv2json">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">CSV Input</Card.Title>
					</Card.Header>
					<Card.Content>
						<Textarea bind:value={csvInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON Output</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("j", jsonOutput)} disabled={!jsonOutput}>
							{#if copiedKey === "j"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={jsonOutput} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>

			{#if csvError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{csvError}
				</div>
			{/if}

			{#if preview && preview.headers.length}
				<Card.Root class="mt-4">
					<Card.Header>
						<Card.Title class="text-base">
							Preview ({preview.rows.length} {preview.rows.length === 1 ? "row" : "rows"})
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b">
										{#each preview.headers as h, i (i)}
											<th class="px-3 py-2 text-left font-semibold">{h}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each preview.rows.slice(0, 50) as row, ri (ri)}
										<tr class="border-b last:border-0">
											{#each preview.headers as _, ci (ci)}
												<td class="px-3 py-1.5 font-mono">{row[ci] ?? ""}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if preview.rows.length > 50}
							<p class="text-muted-foreground mt-2 text-xs">
								Showing first 50 of {preview.rows.length} rows.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="json2csv">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">JSON Input</Card.Title>
						<Card.Description>Must be an array of objects.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">CSV Output</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("c", csvOutput)} disabled={!csvOutput}>
							{#if copiedKey === "c"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={csvOutput} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>

			{#if jsonError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{jsonError}
				</div>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</main>
