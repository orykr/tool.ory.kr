<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { numberToWords, numberToOrdinal } from "$lib/num-words";

	let input = $state("1234567");

	let result = $derived.by(() => {
		try {
			return {
				ok: true as const,
				cardinal: numberToWords(input),
				ordinal: numberToOrdinal(input)
			};
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	const samples = ["0", "21", "100", "1234", "1000000", "-42", "3.14", "1234567"];

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-3xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Number → Words</h1>
		<p class="text-muted-foreground mt-1">
			Convert numbers to English words (cardinal and ordinal). Supports up to quadrillions.
		</p>
	</header>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Number</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<Input bind:value={input} class="font-mono" />
			<div class="flex flex-wrap gap-1">
				{#each samples as s (s)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-0.5 font-mono text-xs"
						onclick={() => (input = s)}
					>
						{s}
					</button>
				{/each}
			</div>

			{#if result.ok}
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<div>
						<p class="text-muted-foreground text-xs">Cardinal</p>
						<p class="font-mono">{result.cardinal}</p>
					</div>
					<Button variant="ghost" size="sm" onclick={() => copy("c", result.cardinal)}>
						{#if copied === "c"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<div>
						<p class="text-muted-foreground text-xs">Ordinal</p>
						<p class="font-mono">{result.ordinal}</p>
					</div>
					<Button variant="ghost" size="sm" onclick={() => copy("o", result.ordinal)}>
						{#if copied === "o"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
			{:else}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{result.error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
