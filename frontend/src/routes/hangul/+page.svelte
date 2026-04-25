<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { romanize, splitJamo, numberToHangulSino } from "$lib/hangul";

	let input = $state("안녕하세요 한국어");
	let romaja = $derived(romanize(input));
	let jamo = $derived(splitJamo(input));

	let numberInput = $state("12345");
	let numberResult = $derived.by(() => {
		const n = Number(numberInput);
		if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 1e16) return null;
		return numberToHangulSino(n);
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Hangul Tools</h1>
		<p class="text-muted-foreground mt-1">
			Korean Hangul → Romaja (Revised Romanization), Jamo splitting, and Sino-Korean numerals.
		</p>
	</header>

	<Tabs.Root value="romaja">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="romaja">Romaja</Tabs.Trigger>
			<Tabs.Trigger value="jamo">Jamo split</Tabs.Trigger>
			<Tabs.Trigger value="number">Number → Hangul</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="romaja">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Hangul → Romaja</Card.Title>
					<Card.Description>
						Letter-by-letter Revised Romanization (no contextual sandhi).
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<Textarea bind:value={input} class="min-h-24 font-mono text-sm" />
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<p class="font-mono text-lg">{romaja || "—"}</p>
						<Button variant="ghost" size="sm" onclick={() => copy("r", romaja)}>
							{#if copied === "r"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="jamo">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Jamo decomposition</Card.Title>
					<Card.Description>Split each syllable into initial / medial / final jamo.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Textarea bind:value={input} class="min-h-24 font-mono text-sm" />
					<div class="mt-3 flex flex-wrap gap-2">
						{#each jamo as item, i (i + item.char)}
							<div class="bg-muted rounded-md p-2 text-center">
								<p class="text-2xl">{item.char}</p>
								<p class="text-muted-foreground mt-1 text-xs">{item.parts.join(" ")}</p>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="number">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Number → Sino-Korean</Card.Title>
					<Card.Description>Up to ~10¹⁶. Native numbers (하나, 둘, ...) not implemented.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="space-y-1.5">
						<Label for="num">Integer</Label>
						<Input id="num" bind:value={numberInput} class="font-mono" />
					</div>
					{#if numberResult !== null}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<p class="text-lg">{numberResult}</p>
							<Button variant="ghost" size="sm" onclick={() => copy("n", numberResult!)}>
								{#if copied === "n"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						</div>
					{:else if numberInput.trim()}
						<p class="text-destructive text-xs">Invalid number (positive integer required).</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
