<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { inferJsonSchema } from "$lib/json-schema";

	let input = $state(
		'{"id":1,"name":"Ada","email":"ada@example.com","tags":["math","cs"],"active":true,"createdAt":"2024-01-01T00:00:00Z"}'
	);
	let title = $state("Root");
	let requireAll = $state(true);
	let includeExamples = $state(false);

	let output = $derived.by(() => {
		try {
			if (!input.trim()) return { ok: true as const, value: "" };
			const parsed = JSON.parse(input);
			const schema = inferJsonSchema(parsed, { title, requireAll, includeExamples });
			return { ok: true as const, value: JSON.stringify(schema, null, 2) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		if (!output.ok) return;
		await navigator.clipboard.writeText(output.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">JSON Schema Generator</h1>
		<p class="text-muted-foreground mt-1">
			Infer a JSON Schema (Draft 2020-12) from a sample document.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="title">Title</Label>
				<Input id="title" bind:value={title} class="w-40 font-mono" />
			</div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={requireAll} class="h-4 w-4 rounded border" />
				Mark all properties required
			</label>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={includeExamples} class="h-4 w-4 rounded border" />
				Include examples
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Sample JSON</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">JSON Schema</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!output.ok || !output.value}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if output.ok}
					<Textarea value={output.value} readonly class="min-h-96 font-mono text-sm" />
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{output.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
