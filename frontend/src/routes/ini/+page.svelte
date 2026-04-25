<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { parseIni, stringifyIni } from "$lib/ini";

	let iniInput = $state(`name = ory
version = 1

[server]
host = "localhost"
port = 8080

[features]
debug = false
trace = true`);
	let jsonOutput = $state("");
	let iniError = $state<string | null>(null);

	let jsonInput = $state(
		'{"name":"ory","version":1,"server":{"host":"localhost","port":8080}}'
	);
	let iniOutput = $state("");
	let jsonError = $state<string | null>(null);

	$effect(() => {
		const v = iniInput;
		try {
			if (!v.trim()) {
				jsonOutput = "";
				iniError = null;
				return;
			}
			jsonOutput = JSON.stringify(parseIni(v), null, 2);
			iniError = null;
		} catch (e) {
			jsonOutput = "";
			iniError = (e as Error).message;
		}
	});

	$effect(() => {
		const v = jsonInput;
		try {
			if (!v.trim()) {
				iniOutput = "";
				jsonError = null;
				return;
			}
			iniOutput = stringifyIni(JSON.parse(v));
			jsonError = null;
		} catch (e) {
			iniOutput = "";
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
		<h1 class="text-3xl font-bold tracking-tight">INI ↔ JSON Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between INI configuration files and JSON. One nesting level supported.
		</p>
	</header>

	<Tabs.Root value="ini2json">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="ini2json">INI → JSON</Tabs.Trigger>
			<Tabs.Trigger value="json2ini">JSON → INI</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="ini2json">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">INI</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={iniInput} class="min-h-72 font-mono text-sm" />
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
			{#if iniError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{iniError}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="json2ini">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">INI</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("i", iniOutput)} disabled={!iniOutput}>
							{#if copied === "i"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={iniOutput} readonly class="min-h-72 font-mono text-sm" />
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
