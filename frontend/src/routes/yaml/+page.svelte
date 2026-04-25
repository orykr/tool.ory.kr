<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import YAML from "yaml";

	let yamlInput = $state(`name: ory
items:
  - id: 1
    tag: alpha
  - id: 2
    tag: beta
active: true`);
	let jsonOutput = $state("");
	let yamlError = $state<string | null>(null);

	let jsonInput = $state(
		'{"name":"ory","items":[{"id":1,"tag":"alpha"},{"id":2,"tag":"beta"}],"active":true}'
	);
	let yamlOutput = $state("");
	let jsonError = $state<string | null>(null);

	$effect(() => {
		const v = yamlInput;
		try {
			if (!v.trim()) {
				jsonOutput = "";
				yamlError = null;
				return;
			}
			const data = YAML.parse(v);
			jsonOutput = JSON.stringify(data, null, 2);
			yamlError = null;
		} catch (e) {
			jsonOutput = "";
			yamlError = (e as Error).message;
		}
	});

	$effect(() => {
		const v = jsonInput;
		try {
			if (!v.trim()) {
				yamlOutput = "";
				jsonError = null;
				return;
			}
			const parsed = JSON.parse(v);
			yamlOutput = YAML.stringify(parsed);
			jsonError = null;
		} catch (e) {
			yamlOutput = "";
			jsonError = (e as Error).message;
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
		<h1 class="text-3xl font-bold tracking-tight">YAML ↔ JSON Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between YAML 1.2 and JSON. Anchors, aliases, and tagged scalars are supported.
		</p>
	</header>

	<Tabs.Root value="yaml2json">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="yaml2json">YAML → JSON</Tabs.Trigger>
			<Tabs.Trigger value="json2yaml">JSON → YAML</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="yaml2json">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">YAML Input</Card.Title>
					</Card.Header>
					<Card.Content>
						<Textarea bind:value={yamlInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON Output</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("j", jsonOutput)} disabled={!jsonOutput}>
							{#if copied === "j"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={jsonOutput} readonly class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
			</div>
			{#if yamlError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{yamlError}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="json2yaml">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">JSON Input</Card.Title>
					</Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">YAML Output</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("y", yamlOutput)} disabled={!yamlOutput}>
							{#if copied === "y"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={yamlOutput} readonly class="min-h-72 font-mono text-sm" />
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
