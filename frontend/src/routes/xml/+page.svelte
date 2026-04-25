<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Wand from "@lucide/svelte/icons/wand-sparkles";
	import Minimize from "@lucide/svelte/icons/minimize-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { formatXml, minifyXml } from "$lib/xml-format";

	let input = $state(
		'<?xml version="1.0"?><root><item id="1"><name>Alpha</name></item><item id="2"><name>Beta</name></item></root>'
	);
	let output = $state("");
	let error = $state<string | null>(null);
	let indent = $state("2");
	let copied = $state(false);

	const indentLabels: Record<string, string> = {
		"2": "2 spaces",
		"4": "4 spaces",
		tab: "Tab"
	};

	function format() {
		const indentStr = indent === "tab" ? "\t" : " ".repeat(Number(indent));
		const result = formatXml(input, indentStr);
		if (result.ok) {
			output = result.output;
			error = null;
		} else {
			output = "";
			error = result.error;
		}
	}

	function minify() {
		try {
			output = minifyXml(input);
			error = null;
		} catch (e) {
			output = "";
			error = (e as Error).message;
		}
	}

	async function copyOut() {
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
		<h1 class="text-3xl font-bold tracking-tight">XML Formatter</h1>
		<p class="text-muted-foreground mt-1">
			Pretty-print or minify XML documents. Validation uses the browser's DOMParser.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="xml-indent">Indent</Label>
				<Select.Root type="single" bind:value={indent}>
					<Select.Trigger id="xml-indent" class="w-32">{indentLabels[indent]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="2">2 spaces</Select.Item>
						<Select.Item value="4">4 spaces</Select.Item>
						<Select.Item value="tab">Tab</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="ml-auto flex flex-wrap gap-2">
				<Button onclick={format}>
					<Wand />
					Format
				</Button>
				<Button variant="secondary" onclick={minify}>
					<Minimize />
					Minify
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
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Output</Card.Title>
				<Button variant="ghost" size="sm" onclick={copyOut} disabled={!output}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={output} readonly class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	{#if error}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{error}
		</div>
	{/if}
</main>
