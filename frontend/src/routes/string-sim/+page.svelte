<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
	import {
		levenshtein,
		jaro,
		jaroWinkler,
		diceCoefficient,
		hammingDistance
	} from "$lib/string-sim";

	let a = $state("kitten");
	let b = $state("sitting");
	let caseInsensitive = $state(false);

	let results = $derived.by(() => {
		const x = caseInsensitive ? a.toLowerCase() : a;
		const y = caseInsensitive ? b.toLowerCase() : b;
		const lev = levenshtein(x, y);
		const len = Math.max(Array.from(x).length, Array.from(y).length);
		const levSim = len === 0 ? 1 : 1 - lev / len;
		return {
			levenshtein: lev,
			levenshteinSim: levSim,
			jaro: jaro(x, y),
			jaroWinkler: jaroWinkler(x, y),
			dice: diceCoefficient(x, y),
			hamming: hammingDistance(x, y)
		};
	});

	function pct(n: number): string {
		return `${(n * 100).toFixed(2)}%`;
	}

	function swap() {
		[a, b] = [b, a];
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
		<h1 class="text-3xl font-bold tracking-tight">String Similarity</h1>
		<p class="text-muted-foreground mt-1">
			Compare two strings using Levenshtein, Jaro-Winkler, Dice, and Hamming distance.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="sa">A</Label>
					<Input id="sa" bind:value={a} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="sb">B</Label>
					<Input id="sb" bind:value={b} class="font-mono" />
				</div>
			</div>
			<div class="flex items-center justify-between">
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={caseInsensitive} class="h-4 w-4 rounded border" />
					Case-insensitive
				</label>
				<Button variant="outline" size="sm" onclick={swap}>
					<ArrowLeftRight />
					Swap
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Results</Card.Title></Card.Header>
		<Card.Content>
			<dl class="space-y-2 text-sm">
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<dt>Levenshtein distance</dt>
					<dd class="font-mono">{results.levenshtein} ({pct(results.levenshteinSim)} similar)</dd>
				</div>
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<dt>Jaro</dt>
					<dd class="font-mono">{results.jaro.toFixed(4)} ({pct(results.jaro)})</dd>
				</div>
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<dt>Jaro-Winkler</dt>
					<dd class="font-mono">{results.jaroWinkler.toFixed(4)} ({pct(results.jaroWinkler)})</dd>
				</div>
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<dt>Sørensen-Dice (bigrams)</dt>
					<dd class="font-mono">{results.dice.toFixed(4)} ({pct(results.dice)})</dd>
				</div>
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<dt>Hamming distance</dt>
					<dd class="font-mono">
						{results.hamming === null ? "(different lengths)" : results.hamming}
					</dd>
				</div>
			</dl>
		</Card.Content>
	</Card.Root>
</main>
