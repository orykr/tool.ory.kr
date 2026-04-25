<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Wand from "@lucide/svelte/icons/wand-sparkles";
	import Minimize from "@lucide/svelte/icons/minimize-2";
	import { formatJson, minifyJson, type JsonFormatResult } from "$lib/json-format";

	let input = $state("");
	let output = $state("");
	let error = $state<string | null>(null);
	let errorLocation = $state<{ line: number; column: number } | null>(null);
	let indent = $state("2");
	let sortKeys = $state(false);
	let copied = $state(false);

	const indentLabels: Record<string, string> = {
		"2": "2 spaces",
		"4": "4 spaces",
		tab: "Tab"
	};

	function applyResult(result: JsonFormatResult) {
		if (result.ok) {
			output = result.output;
			error = null;
			errorLocation = null;
		} else {
			output = "";
			error = result.error;
			errorLocation =
				result.line && result.column ? { line: result.line, column: result.column } : null;
		}
	}

	function format() {
		const indentValue: number | "\t" = indent === "tab" ? "\t" : Number(indent);
		applyResult(formatJson(input, indentValue, sortKeys));
	}

	function minify() {
		applyResult(minifyJson(input));
	}

	async function copyOutput() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function clearAll() {
		input = "";
		output = "";
		error = null;
		errorLocation = null;
	}

	function loadSample() {
		input = `{"name":"ory","items":[{"id":1,"tag":"alpha"},{"id":2,"tag":"beta"}],"active":true,"meta":{"created":"2026-04-26"}}`;
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
		<h1 class="text-3xl font-bold tracking-tight">JSON Formatter</h1>
		<p class="text-muted-foreground mt-1">
			Pretty-print, minify, validate, and sort keys — all in your browser.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="indent">Indent</Label>
				<Select.Root type="single" bind:value={indent}>
					<Select.Trigger id="indent" class="w-32">
						{indentLabels[indent]}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="2">2 spaces</Select.Item>
						<Select.Item value="4">4 spaces</Select.Item>
						<Select.Item value="tab">Tab</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={sortKeys} class="h-4 w-4 rounded border" />
				Sort keys
			</label>

			<div class="ml-auto flex flex-wrap gap-2">
				<Button onclick={format}>
					<Wand />
					Format
				</Button>
				<Button variant="secondary" onclick={minify}>
					<Minimize />
					Minify
				</Button>
				<Button variant="ghost" onclick={loadSample}>Sample</Button>
				<Button variant="ghost" onclick={clearAll} disabled={!input && !output}>
					<Trash2 />
					Clear
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Input</Card.Title>
			</Card.Header>
			<Card.Content>
				<Textarea
					bind:value={input}
					placeholder={'{ "paste": "JSON here" }'}
					class="min-h-96 font-mono text-sm"
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Output</Card.Title>
				<Button variant="ghost" size="sm" onclick={copyOutput} disabled={!output}>
					{#if copied}
						<Check />
						Copied
					{:else}
						<Copy />
						Copy
					{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea
					value={output}
					readonly
					placeholder="Formatted output appears here..."
					class="min-h-96 font-mono text-sm"
				/>
			</Card.Content>
		</Card.Root>
	</div>

	{#if error}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-4 text-sm"
		>
			<p class="font-medium">{error}</p>
			{#if errorLocation}
				<p class="mt-1 text-xs">
					at line {errorLocation.line}, column {errorLocation.column}
				</p>
			{/if}
		</div>
	{/if}
</main>
