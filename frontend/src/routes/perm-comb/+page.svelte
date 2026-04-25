<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let n = $state(10);
	let r = $state(3);

	function factorialBig(x: number): bigint {
		if (!Number.isInteger(x) || x < 0) throw new Error("n must be a non-negative integer.");
		let result = 1n;
		for (let i = 2; i <= x; i++) result *= BigInt(i);
		return result;
	}

	let result = $derived.by(() => {
		try {
			const N = Math.floor(Number(n));
			const R = Math.floor(Number(r));
			if (!Number.isFinite(N) || !Number.isFinite(R)) {
				return { ok: false as const, error: "Enter integers." };
			}
			if (N < 0 || R < 0) return { ok: false as const, error: "n and r must be ≥ 0." };
			if (R > N) return { ok: false as const, error: "r must be ≤ n." };
			if (N > 1000) return { ok: false as const, error: "n too large (≤ 1000)." };
			const factorial = factorialBig(N);
			let permutation = 1n;
			for (let i = N; i > N - R; i--) permutation *= BigInt(i);
			let combination = permutation;
			for (let i = 1; i <= R; i++) combination /= BigInt(i);
			const repPerm = BigInt(N) ** BigInt(R);
			let repComb = 1n;
			for (let i = 0; i < R; i++) repComb = (repComb * BigInt(N + R - 1 - i)) / BigInt(i + 1);
			return {
				ok: true as const,
				factorial,
				permutation,
				combination,
				repPerm,
				repComb
			};
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
		<h1 class="text-3xl font-bold tracking-tight">Permutations & Combinations</h1>
		<p class="text-muted-foreground mt-1">
			Compute factorials, permutations, and combinations (with and without repetition) using BigInt.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Inputs</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="n">n (total)</Label>
				<Input id="n" type="number" min="0" max="1000" bind:value={n} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="r">r (selected)</Label>
				<Input id="r" type="number" min="0" max="1000" bind:value={r} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	{#if result.ok}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Results</Card.Title></Card.Header>
			<Card.Content>
				<dl class="space-y-2 text-sm">
					{#each [
						{ k: `n! (${n}!)`, v: result.factorial.toString(), key: "f" },
						{ k: `P(n, r) — permutations`, v: result.permutation.toString(), key: "p" },
						{ k: `C(n, r) — combinations`, v: result.combination.toString(), key: "c" },
						{ k: `Permutations with repetition (n^r)`, v: result.repPerm.toString(), key: "pr" },
						{ k: `Combinations with repetition (n+r-1 C r)`, v: result.repComb.toString(), key: "cr" }
					] as item (item.key)}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<div class="min-w-0 flex-1">
								<dt class="text-muted-foreground text-xs">{item.k}</dt>
								<dd class="font-mono text-sm break-all">{item.v}</dd>
							</div>
							<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
								{#if copied === item.key}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{/each}
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{result.error}
		</div>
	{/if}
</main>
