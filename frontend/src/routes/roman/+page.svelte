<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { intToRoman, romanToInt } from "$lib/roman";

	let intInput = $state("2026");
	let romanInput = $state("MCMXCIV");

	let intResult = $derived.by(() => {
		const n = Number(intInput);
		if (!intInput.trim()) return { ok: true as const, value: "" };
		if (!Number.isFinite(n)) return { ok: false as const, error: "Not a number." };
		try {
			return { ok: true as const, value: intToRoman(n) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let romanResult = $derived.by(() => {
		if (!romanInput.trim()) return { ok: true as const, value: "" };
		try {
			return { ok: true as const, value: String(romanToInt(romanInput)) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
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
		<h1 class="text-3xl font-bold tracking-tight">Roman Numerals</h1>
		<p class="text-muted-foreground mt-1">
			Convert between integers and Roman numerals (range 1–3999).
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Integer → Roman</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="int-in">Integer (1–3999)</Label>
					<Input id="int-in" type="number" min="1" max="3999" bind:value={intInput} class="font-mono" />
				</div>
				{#if intResult.ok}
					{#if intResult.value}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<span class="font-mono text-lg">{intResult.value}</span>
							<Button variant="ghost" size="sm" onclick={() => copy("i", intResult.value)}>
								{#if copied === "i"}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{/if}
				{:else}
					<p class="text-destructive text-xs">{intResult.error}</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Roman → Integer</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="r-in">Roman numeral</Label>
					<Input id="r-in" bind:value={romanInput} class="font-mono uppercase" />
				</div>
				{#if romanResult.ok}
					{#if romanResult.value}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<span class="font-mono text-lg">{romanResult.value}</span>
							<Button variant="ghost" size="sm" onclick={() => copy("r", romanResult.value)}>
								{#if copied === "r"}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{/if}
				{:else}
					<p class="text-destructive text-xs">{romanResult.error}</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
