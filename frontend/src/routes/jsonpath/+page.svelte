<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { queryPath } from "$lib/jsonpath";

	let json = $state(`{
  "store": {
    "books": [
      {"title":"Pride and Prejudice","author":"Austen","price":12.99},
      {"title":"Frankenstein","author":"Shelley","price":9.5},
      {"title":"Dune","author":"Herbert","price":15}
    ],
    "owner": "Ada"
  }
}`);
	let path = $state("$.store.books[*].title");

	let result = $derived.by(() => {
		try {
			const parsed = JSON.parse(json);
			return { ok: true as const, matches: queryPath(parsed, path) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	const examples = [
		"$",
		"$.store",
		"$.store.books[*]",
		"$.store.books[0]",
		"$.store.books[-1]",
		"$.store.books[*].title",
		"$.store.books[1:3]",
		"$..title",
		'$.store["owner"]'
	];

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
		<h1 class="text-3xl font-bold tracking-tight">JSON Path Query</h1>
		<p class="text-muted-foreground mt-1">
			Query JSON with a subset of JSONPath: keys, indexes, wildcards, recursive descent, slices.
		</p>
	</header>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={json} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Path</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<Input bind:value={path} class="font-mono" placeholder="$.foo.bar" />
				<div class="flex flex-wrap gap-1">
					{#each examples as e (e)}
						<button
							type="button"
							class="bg-background hover:bg-muted rounded border px-2 py-0.5 font-mono text-xs"
							onclick={() => (path = e)}
						>
							{e}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">
				{#if result.ok}Matches ({result.matches.length}){:else}Error{/if}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if !result.ok}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					{result.error}
				</div>
			{:else if result.matches.length === 0}
				<p class="text-muted-foreground text-sm">No matches.</p>
			{:else}
				<ul class="divide-y">
					{#each result.matches as m, i (i)}
						<li class="grid grid-cols-[200px_1fr_auto] gap-3 py-2 text-sm">
							<code class="text-muted-foreground break-all">{m.path}</code>
							<pre class="bg-muted overflow-x-auto rounded p-2 font-mono text-xs">{JSON.stringify(m.value, null, 2)}</pre>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => copy(`m${i}`, JSON.stringify(m.value, null, 2))}
							>
								{#if copied === `m${i}`}<Check />{:else}<Copy />{/if}
							</Button>
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
