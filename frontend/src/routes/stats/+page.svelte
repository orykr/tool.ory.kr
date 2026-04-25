<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import { parseNumbers, computeStats } from "$lib/stats";

	let input = $state("4 8 15 16 23 42\n7 19 23 30 50");

	let parsed = $derived(parseNumbers(input));
	let stats = $derived(computeStats(parsed));

	function fmt(n: number | null, digits = 4): string {
		if (n === null || !Number.isFinite(n)) return "—";
		const fixed = n.toFixed(digits);
		return fixed.replace(/\.?0+$/, "");
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
		<h1 class="text-3xl font-bold tracking-tight">Statistics Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Compute mean, median, mode, standard deviation, quartiles, and more.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Numbers</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<Textarea
				bind:value={input}
				class="min-h-32 font-mono text-sm"
				placeholder="Separate by spaces, commas, semicolons, or newlines."
			/>
			<p class="text-muted-foreground text-xs">{parsed.length} valid numbers parsed</p>
		</Card.Content>
	</Card.Root>

	{#if stats}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Results</Card.Title></Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each [
						{ k: "Count", v: stats.count.toString() },
						{ k: "Sum", v: fmt(stats.sum) },
						{ k: "Mean", v: fmt(stats.mean) },
						{ k: "Median", v: fmt(stats.median) },
						{ k: "Mode", v: stats.mode.length ? stats.mode.join(", ") : "(none)" },
						{ k: "Min", v: fmt(stats.min) },
						{ k: "Max", v: fmt(stats.max) },
						{ k: "Range", v: fmt(stats.range) },
						{ k: "Variance", v: fmt(stats.variance) },
						{ k: "Std Dev (σ)", v: fmt(stats.stdDev) },
						{ k: "Q1 (25%)", v: fmt(stats.q1) },
						{ k: "Q3 (75%)", v: fmt(stats.q3) },
						{ k: "IQR", v: fmt(stats.iqr) },
						{ k: "Geometric mean", v: fmt(stats.geometricMean) },
						{ k: "Harmonic mean", v: fmt(stats.harmonicMean) }
					] as item, i (i)}
						<div class="bg-muted rounded-md p-3">
							<dt class="text-muted-foreground text-xs">{item.k}</dt>
							<dd class="font-mono text-sm break-all">{item.v}</dd>
						</div>
					{/each}
				</dl>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
