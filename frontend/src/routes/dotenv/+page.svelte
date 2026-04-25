<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { parseDotenv, envToJson, envToShellExport } from "$lib/dotenv";

	let input = $state(`# Application config
NODE_ENV=production
PORT=3000
DATABASE_URL="postgres://user:p%40ss@localhost:5432/db"
SECRET_KEY='abc#123$~'
export TRACE=1
GREETING="Hello\\nworld"`);

	let result = $derived(parseDotenv(input));
	let json = $derived(JSON.stringify(envToJson(result.entries), null, 2));
	let shellExport = $derived(envToShellExport(result.entries));

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Dotenv Parser</h1>
		<p class="text-muted-foreground mt-1">
			Parse <code>.env</code> files (with quotes, escapes, exports, and inline comments) into JSON or shell export.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">.env content</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-48 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	{#if result.errors.length > 0}
		<Card.Root class="mb-4">
			<Card.Content class="pt-6">
				<ul class="text-destructive space-y-1 text-sm">
					{#each result.errors as e (e.line)}
						<li>Line {e.line}: {e.message}</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}

	<Tabs.Root value="entries">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="entries">Parsed</Tabs.Trigger>
			<Tabs.Trigger value="json">JSON</Tabs.Trigger>
			<Tabs.Trigger value="shell">Shell</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="entries">
			<Card.Root>
				<Card.Content class="pt-6">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left">
								<th class="px-2 py-2">Line</th>
								<th class="px-2 py-2">Key</th>
								<th class="px-2 py-2">Value</th>
								<th class="px-2 py-2">Export</th>
							</tr>
						</thead>
						<tbody>
							{#each result.entries as e (e.line)}
								<tr class="border-b last:border-0">
									<td class="text-muted-foreground px-2 py-1 font-mono">{e.line}</td>
									<td class="px-2 py-1 font-mono font-semibold">{e.key}</td>
									<td class="px-2 py-1 font-mono break-all">{e.value}</td>
									<td class="px-2 py-1">{e.exported ? "yes" : ""}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="json">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">JSON</Card.Title>
					<Button variant="ghost" size="sm" onclick={() => copy("j", json)}>
						{#if copied === "j"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">{json}</pre>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="shell">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Shell exports</Card.Title>
					<Button variant="ghost" size="sm" onclick={() => copy("s", shellExport)}>
						{#if copied === "s"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">{shellExport}</pre>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
