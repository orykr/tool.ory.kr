<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { get, listAllPointers, escapeToken, unescapeToken } from "$lib/json-ptr";

	let json = $state(`{
  "store": {
    "books": [
      {"title":"Pride and Prejudice","price":12.99},
      {"title":"Frankenstein","price":9.50}
    ],
    "owner": "Ada / Lovelace"
  }
}`);
	let pointer = $state("/store/books/0/title");

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: JSON.parse(json) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let result = $derived.by(() => {
		if (!parsed.ok) return { kind: "json-error" as const, error: parsed.error };
		try {
			const value = get(parsed.data, pointer);
			return { kind: "ok" as const, value };
		} catch (e) {
			return { kind: "ptr-error" as const, error: (e as Error).message };
		}
	});

	let allPointers = $derived(parsed.ok ? listAllPointers(parsed.data) : []);

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
		<h1 class="text-3xl font-bold tracking-tight">JSON Pointer (RFC 6901)</h1>
		<p class="text-muted-foreground mt-1">
			Resolve, escape, and enumerate JSON Pointers. Tokens are slash-separated; <code>~</code> →
			<code>~0</code> and <code>/</code> → <code>~1</code>.
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
			<Card.Header><Card.Title class="text-base">Pointer</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<Input bind:value={pointer} class="font-mono" placeholder="/path/to/value" />

				{#if result.kind === "ok"}
					<div class="bg-muted rounded-md p-3">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-xs">Value</span>
							<Button variant="ghost" size="sm" onclick={() => copy("v", JSON.stringify(result.value, null, 2))}>
								{#if copied === "v"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						</div>
						<pre class="mt-1 overflow-x-auto font-mono text-xs">{JSON.stringify(result.value, null, 2)}</pre>
					</div>
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{result.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if parsed.ok}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">All pointers ({allPointers.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				<ul class="bg-muted max-h-72 overflow-auto rounded-md p-3 font-mono text-xs">
					{#each allPointers as p, i (i + p)}
						<li class="border-b py-0.5 last:border-0">
							<button type="button" class="hover:text-primary text-left" onclick={() => (pointer = p)}>
								{p || "(root)"}
							</button>
						</li>
					{/each}
				</ul>
				<p class="text-muted-foreground mt-2 text-xs">
					Token escapes: <code>~0</code> represents <code>~</code>, <code>~1</code> represents <code>/</code>.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
