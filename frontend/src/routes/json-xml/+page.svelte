<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { jsonToXml, xmlToJson } from "$lib/json-xml";

	let jsonInput = $state(
		'{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"active":true}'
	);
	let rootName = $state("root");
	let xmlOutput = $state("");
	let jsonError = $state<string | null>(null);

	let xmlInput = $state(
		'<?xml version="1.0"?>\n<root>\n  <user id="1">\n    <name>Alice</name>\n    <age>30</age>\n  </user>\n</root>'
	);
	let jsonOutput = $state("");
	let xmlError = $state<string | null>(null);

	$effect(() => {
		const j = jsonInput;
		const r = rootName;
		try {
			if (!j.trim()) {
				xmlOutput = "";
				jsonError = null;
				return;
			}
			const parsed = JSON.parse(j);
			xmlOutput = jsonToXml(parsed, r || "root");
			jsonError = null;
		} catch (e) {
			xmlOutput = "";
			jsonError = (e as Error).message;
		}
	});

	$effect(() => {
		const x = xmlInput;
		try {
			if (!x.trim()) {
				jsonOutput = "";
				xmlError = null;
				return;
			}
			jsonOutput = JSON.stringify(xmlToJson(x), null, 2);
			xmlError = null;
		} catch (e) {
			jsonOutput = "";
			xmlError = (e as Error).message;
		}
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">JSON ↔ XML Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between JSON and XML. Attributes are prefixed with <code>@</code>.
		</p>
	</header>

	<Tabs.Root value="json2xml">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="json2xml">JSON → XML</Tabs.Trigger>
			<Tabs.Trigger value="xml2json">XML → JSON</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="json2xml">
			<Card.Root class="mb-3">
				<Card.Content class="flex items-center gap-3 pt-6">
					<Label for="root">Root element</Label>
					<Input id="root" bind:value={rootName} class="w-48 font-mono" />
				</Card.Content>
			</Card.Root>

			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">XML</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("x", xmlOutput)} disabled={!xmlOutput}>
							{#if copied === "x"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={xmlOutput} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>
			{#if jsonError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{jsonError}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="xml2json">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">XML</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={xmlInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("j", jsonOutput)} disabled={!jsonOutput}>
							{#if copied === "j"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={jsonOutput} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>
			{#if xmlError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{xmlError}
				</div>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</main>
