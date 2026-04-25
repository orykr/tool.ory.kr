<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import JSON5 from "json5";

	let json5Input = $state(`{
  // single-line comment
  name: 'ory',
  version: 1.0,
  /* multi-line
     comment */
  features: [
    'fast',
    'safe',
    'fun',
  ],
  config: { debug: true, port: 0xff },
  hex: 0xdeadbeef,
}`);
	let jsonOutput = $state("");
	let json5Error = $state<string | null>(null);

	let jsonInput = $state(
		'{"name":"ory","version":1.0,"features":["fast","safe","fun"],"config":{"debug":true,"port":255}}'
	);
	let json5Output = $state("");
	let jsonError = $state<string | null>(null);

	$effect(() => {
		const v = json5Input;
		try {
			if (!v.trim()) {
				jsonOutput = "";
				json5Error = null;
				return;
			}
			jsonOutput = JSON.stringify(JSON5.parse(v), null, 2);
			json5Error = null;
		} catch (e) {
			jsonOutput = "";
			json5Error = (e as Error).message;
		}
	});

	$effect(() => {
		const v = jsonInput;
		try {
			if (!v.trim()) {
				json5Output = "";
				jsonError = null;
				return;
			}
			const parsed = JSON.parse(v);
			json5Output = JSON5.stringify(parsed, null, 2);
			jsonError = null;
		} catch (e) {
			json5Output = "";
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
		<h1 class="text-3xl font-bold tracking-tight">JSON5 ↔ JSON</h1>
		<p class="text-muted-foreground mt-1">
			Convert between JSON5 (with comments, trailing commas, hex literals) and strict JSON.
		</p>
	</header>

	<Tabs.Root value="j52j">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="j52j">JSON5 → JSON</Tabs.Trigger>
			<Tabs.Trigger value="j2j5">JSON → JSON5</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="j52j">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON5</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={json5Input} class="min-h-72 font-mono text-sm" />
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
			{#if json5Error}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{json5Error}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="j2j5">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">JSON5</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("5", json5Output)} disabled={!json5Output}>
							{#if copied === "5"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={json5Output} readonly class="min-h-72 font-mono text-sm" />
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
