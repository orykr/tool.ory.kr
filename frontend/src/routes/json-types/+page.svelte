<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { inferTypes, type Style } from "$lib/json-types";

	let input = $state(
		'{"name":"Ada","age":36,"active":true,"tags":["math","science"],"contact":{"email":"ada@example.com","phone":null}}'
	);
	let rootName = $state("Root");
	let style = $state<Style>("interface");
	let optionalNullable = $state(true);

	const styleLabels: Record<Style, string> = {
		interface: "TypeScript interface",
		type: "TypeScript type",
		zod: "Zod schema (z.object)"
	};

	let output = $derived.by(() => {
		try {
			if (!input.trim()) return { ok: true as const, value: "" };
			const parsed = JSON.parse(input);
			return {
				ok: true as const,
				value: inferTypes(parsed, { rootName: rootName || "Root", style, optionalNullable })
			};
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
		<h1 class="text-3xl font-bold tracking-tight">JSON → TypeScript Types</h1>
		<p class="text-muted-foreground mt-1">
			Infer TypeScript interfaces, type aliases, or Zod schemas from JSON.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="root">Root name</Label>
				<Input id="root" bind:value={rootName} class="w-40 font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="style">Style</Label>
				<Select.Root type="single" bind:value={style as never}>
					<Select.Trigger id="style" class="w-56">{styleLabels[style]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="interface">TypeScript interface</Select.Item>
						<Select.Item value="type">TypeScript type</Select.Item>
						<Select.Item value="zod">Zod schema</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm">
				<input type="checkbox" bind:checked={optionalNullable} class="h-4 w-4 rounded border" />
				Mark nullable fields as optional
			</label>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">JSON</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-96 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Generated</Card.Title>
				<Button
					variant="ghost"
					size="sm"
					onclick={copy}
					disabled={!output.ok || !output.value}
				>
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
