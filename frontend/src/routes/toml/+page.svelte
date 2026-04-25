<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import TOML from "@iarna/toml";

	let tomlInput = $state(`title = "Example"
version = 1

[server]
host = "localhost"
port = 8080

[[users]]
name = "Alice"
admin = true

[[users]]
name = "Bob"
admin = false`);
	let jsonOutput = $state("");
	let tomlError = $state<string | null>(null);

	let jsonInput = $state(
		'{"title":"Example","version":1,"server":{"host":"localhost","port":8080}}'
	);
	let tomlOutput = $state("");
	let jsonError = $state<string | null>(null);

	$effect(() => {
		const v = tomlInput;
		try {
			if (!v.trim()) {
				jsonOutput = "";
				tomlError = null;
				return;
			}
			jsonOutput = JSON.stringify(TOML.parse(v), null, 2);
			tomlError = null;
		} catch (e) {
			jsonOutput = "";
			tomlError = (e as Error).message;
		}
	});

	$effect(() => {
		const v = jsonInput;
		try {
			if (!v.trim()) {
				tomlOutput = "";
				jsonError = null;
				return;
			}
			const parsed = JSON.parse(v);
			tomlOutput = TOML.stringify(parsed);
			jsonError = null;
		} catch (e) {
			tomlOutput = "";
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
		<h1 class="text-3xl font-bold tracking-tight">TOML ↔ JSON Converter</h1>
		<p class="text-muted-foreground mt-1">Convert between TOML 1.0 and JSON.</p>
	</header>

	<Tabs.Root value="toml2json">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="toml2json">TOML → JSON</Tabs.Trigger>
			<Tabs.Trigger value="json2toml">JSON → TOML</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="toml2json">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">TOML</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={tomlInput} class="min-h-72 font-mono text-sm" />
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
			{#if tomlError}
				<div class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm">
					{tomlError}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="json2toml">
			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
					<Card.Content>
						<Textarea bind:value={jsonInput} class="min-h-72 font-mono text-sm" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-base">TOML</Card.Title>
						<Button variant="ghost" size="sm" onclick={() => copy("t", tomlOutput)} disabled={!tomlOutput}>
							{#if copied === "t"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</Card.Header>
					<Card.Content>
						<Textarea value={tomlOutput} readonly class="min-h-72 font-mono text-sm" />
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
