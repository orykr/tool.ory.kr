<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import { validateIban } from "$lib/iban";

	let input = $state("DE89 3704 0044 0532 0130 00");
	let result = $derived(validateIban(input));

	const samples = [
		"DE89 3704 0044 0532 0130 00",
		"GB29 NWBK 6016 1331 9268 19",
		"FR14 2004 1010 0505 0001 3M02 606",
		"NL91 ABNA 0417 1643 00",
		"CH93 0076 2011 6238 5295 7"
	];
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
		<h1 class="text-3xl font-bold tracking-tight">IBAN Validator</h1>
		<p class="text-muted-foreground mt-1">
			Validate International Bank Account Numbers via mod-97 checksum.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">IBAN</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="iban">Number (case-insensitive, spaces ignored)</Label>
				<Input id="iban" bind:value={input} class="font-mono" />
			</div>
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
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				{#if result.valid}
					<CheckCircle class="h-5 w-5 text-emerald-500" />
					<span class="font-semibold">Valid IBAN</span>
				{:else}
					<XCircle class="text-destructive h-5 w-5" />
					<span class="font-semibold">{result.error ?? "Invalid"}</span>
				{/if}
			</div>

			{#if result.country}
				<dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
					<div>
						<dt class="text-muted-foreground text-xs">Country</dt>
						<dd class="font-mono">{result.country}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground text-xs">Check digits</dt>
						<dd class="font-mono">{result.checkDigits ?? "—"}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground text-xs">Length</dt>
						<dd class="font-mono">{result.length ?? "—"} (expected {result.expectedLength ?? "—"})</dd>
					</div>
					<div class="col-span-2">
						<dt class="text-muted-foreground text-xs">Formatted</dt>
						<dd class="bg-muted mt-1 rounded p-2 font-mono">{result.formatted ?? "—"}</dd>
					</div>
					{#if result.bban}
						<div class="col-span-2">
							<dt class="text-muted-foreground text-xs">BBAN (national part)</dt>
							<dd class="font-mono break-all">{result.bban}</dd>
						</div>
					{/if}
				</dl>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
