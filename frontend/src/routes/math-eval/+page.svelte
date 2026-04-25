<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { evaluate } from "$lib/math-eval";

	let input = $state("sqrt(16) + sin(pi/2) * 10");

	let result = $derived.by(() => {
		const t = input.trim();
		if (!t) return null;
		try {
			return { ok: true as const, value: evaluate(t) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	const samples = [
		"2 + 3 * 4",
		"(1 + 2)^3",
		"sqrt(2)",
		"sin(pi/4) * 2",
		"log10(1000)",
		"hypot(3, 4)",
		"min(1, 2, 3) + max(4, 5, 6)",
		"e^pi"
	];

	let copied = $state(false);
	async function copy() {
		if (!result?.ok) return;
		await navigator.clipboard.writeText(String(result.value));
		copied = true;
		setTimeout(() => (copied = false), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Math Expression Evaluator</h1>
		<p class="text-muted-foreground mt-1">
			Evaluate math expressions safely (custom parser; no <code>eval</code>).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Expression</Card.Title></Card.Header>
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
			{#if result}
				{#if result.ok}
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<div>
							<p class="text-muted-foreground text-xs">Result</p>
							<p class="font-mono text-2xl">{result.value}</p>
						</div>
						<Button variant="ghost" size="sm" onclick={copy}>
							{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{result.error}
					</div>
				{/if}
			{/if}
			<div class="text-muted-foreground text-xs">
				<p>Operators: <code>+ - * / % ^</code></p>
				<p>Functions: abs, sqrt, cbrt, sin, cos, tan, asin, acos, atan, atan2, log, log2, log10, exp, floor, ceil, round, sign, min, max, hypot, pow, mod</p>
				<p>Constants: pi, e, tau, inf</p>
			</div>
		</Card.Content>
	</Card.Root>
</main>
