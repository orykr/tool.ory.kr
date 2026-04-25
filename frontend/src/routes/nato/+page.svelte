<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { textToNato, NATO_ALPHABET } from "$lib/nato";

	let input = $state("Hello 123");
	let output = $derived(textToNato(input));

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	const letters = Object.entries(NATO_ALPHABET).filter(([k]) => /[A-Z]/.test(k));
	const numbers = Object.entries(NATO_ALPHABET).filter(([k]) => /[0-9]/.test(k));
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
		<h1 class="text-3xl font-bold tracking-tight">NATO Phonetic Alphabet</h1>
		<p class="text-muted-foreground mt-1">
			Spell text aloud using the international NATO/ICAO phonetic alphabet.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Translator</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-1.5">
				<Label for="nato-in">Input</Label>
				<Textarea id="nato-in" bind:value={input} class="min-h-24 font-mono text-sm" />
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label>Phonetic</Label>
					<Button variant="ghost" size="sm" onclick={copy} disabled={!output}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<Textarea value={output} readonly class="min-h-24 font-mono text-sm" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Reference</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
				<div class="space-y-1">
					{#each letters as [k, v] (k)}
						<div class="flex justify-between border-b py-1 text-sm last:border-0">
							<span class="font-mono font-semibold">{k}</span>
							<span>{v}</span>
						</div>
					{/each}
				</div>
				<div class="space-y-1">
					{#each numbers as [k, v] (k)}
						<div class="flex justify-between border-b py-1 text-sm last:border-0">
							<span class="font-mono font-semibold">{k}</span>
							<span>{v}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</main>
