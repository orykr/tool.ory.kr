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

	let input = $state(
		'[{"name":"Bob","age":25,"score":78},{"name":"Alice","age":30,"score":92},{"name":"Charlie","age":22,"score":85}]'
	);
	let key = $state("name");
	let order = $state<"asc" | "desc">("asc");
	let mode = $state<"by-key" | "deep-keys">("by-key");

	function compare(a: unknown, b: unknown): number {
		if (typeof a === "number" && typeof b === "number") return a - b;
		if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
		if (a === null && b === null) return 0;
		if (a === null) return -1;
		if (b === null) return 1;
		return String(a).localeCompare(String(b));
	}

	function sortDeepKeys(value: unknown): unknown {
		if (Array.isArray(value)) return value.map(sortDeepKeys);
		if (value && typeof value === "object") {
			const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
				a.localeCompare(b)
			);
			const out: Record<string, unknown> = {};
			for (const [k, v] of entries) out[k] = sortDeepKeys(v);
			return out;
		}
		return value;
	}

	let result = $derived.by(() => {
		try {
			if (!input.trim()) return { ok: true as const, value: "" };
			const parsed = JSON.parse(input);
			let processed: unknown;
			if (mode === "deep-keys") {
				processed = sortDeepKeys(parsed);
			} else {
				if (!Array.isArray(parsed)) {
					return { ok: false as const, error: "Input must be a JSON array for 'sort by key' mode." };
				}
				const sorted = [...parsed].sort((a, b) => {
					const av = a && typeof a === "object" ? (a as Record<string, unknown>)[key] : a;
					const bv = b && typeof b === "object" ? (b as Record<string, unknown>)[key] : b;
					return compare(av, bv);
				});
				if (order === "desc") sorted.reverse();
				processed = sorted;
			}
			return { ok: true as const, value: JSON.stringify(processed, null, 2) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state(false);
	async function copy() {
		if (!result.ok) return;
		await navigator.clipboard.writeText(result.value);
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
		<h1 class="text-3xl font-bold tracking-tight">JSON Sorter</h1>
		<p class="text-muted-foreground mt-1">
			Sort an array of objects by a property, or alphabetically sort all keys throughout a document.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="md">Mode</Label>
				<Select.Root type="single" bind:value={mode as never}>
					<Select.Trigger id="md" class="w-full">{mode}</Select.Trigger>
					<Select.Content>
						<Select.Item value="by-key">Sort array by property</Select.Item>
						<Select.Item value="deep-keys">Sort all object keys (deep)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			{#if mode === "by-key"}
				<div class="space-y-1.5">
					<Label for="ky">Property name</Label>
					<Input id="ky" bind:value={key} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="or">Direction</Label>
					<Select.Root type="single" bind:value={order as never}>
						<Select.Trigger id="or" class="w-full">{order}</Select.Trigger>
						<Select.Content>
							<Select.Item value="asc">Ascending</Select.Item>
							<Select.Item value="desc">Descending</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Input JSON</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Sorted</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!result.ok || !result.value}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if result.ok}
					<Textarea value={result.value} readonly class="min-h-72 font-mono text-sm" />
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{result.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
