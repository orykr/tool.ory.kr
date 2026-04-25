<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import { isValidLuhn, luhnCheckDigit, luhnDigits, detectCardBrand } from "$lib/luhn";

	let input = $state("4111 1111 1111 1111");

	let result = $derived.by(() => {
		const digits = luhnDigits(input);
		if (digits.length < 2) return null;
		return {
			digits: digits.length,
			valid: isValidLuhn(input),
			brand: detectCardBrand(input),
			normalized: digits.join("")
		};
	});

	let suffixInput = $state("4111 1111 1111 111");
	let nextDigit = $derived.by(() => {
		const digits = luhnDigits(suffixInput);
		if (digits.length < 1) return null;
		return luhnCheckDigit(suffixInput);
	});

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
		<h1 class="text-3xl font-bold tracking-tight">Luhn Validator</h1>
		<p class="text-muted-foreground mt-1">
			Validate credit card / IMEI / NPI numbers using the Luhn checksum.
			Validation does not confirm a real account exists.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Validate</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="luhn-in">Number</Label>
				<Input id="luhn-in" bind:value={input} class="font-mono" placeholder="4111 1111 1111 1111" />
			</div>
			{#if result}
				<div class="bg-muted space-y-2 rounded-md p-3">
					<div class="flex items-center gap-2">
						{#if result.valid}
							<CheckCircle class="h-5 w-5 text-emerald-500" />
							<span class="font-semibold">Valid Luhn checksum</span>
						{:else}
							<XCircle class="text-destructive h-5 w-5" />
							<span class="font-semibold">Invalid Luhn checksum</span>
						{/if}
					</div>
					<dl class="grid grid-cols-2 gap-2 text-sm">
						<div>
							<dt class="text-muted-foreground text-xs">Digits</dt>
							<dd class="font-mono">{result.digits}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground text-xs">Card brand</dt>
							<dd class="font-mono">{result.brand ?? "(unknown)"}</dd>
						</div>
					</dl>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Compute Check Digit</Card.Title>
			<Card.Description>Append the resulting digit to make the number Luhn-valid.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="luhn-pre">Number without check digit</Label>
				<Input id="luhn-pre" bind:value={suffixInput} class="font-mono" />
			</div>
			{#if nextDigit !== null}
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<div>
						<p class="text-muted-foreground text-xs">Check digit</p>
						<p class="font-mono text-2xl font-semibold">{nextDigit}</p>
						<p class="text-muted-foreground mt-1 font-mono text-sm">
							Full: {luhnDigits(suffixInput).join("")}{nextDigit}
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => copy("d", luhnDigits(suffixInput).join("") + nextDigit)}
					>
						{#if copied === "d"}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
