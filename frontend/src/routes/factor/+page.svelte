<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import { isPrime, factorize, gcd, lcm, divisors } from "$lib/factor";

	let nInput = $state("360");

	let result = $derived.by(() => {
		const t = nInput.trim();
		if (!t) return null;
		try {
			const n = BigInt(t);
			if (n <= 0n) return { ok: false as const, error: "Enter a positive integer." };
			const prime = isPrime(n);
			const { factors, remaining } = factorize(n);
			const divs = n <= 10_000_000n ? divisors(n) : null;
			return { ok: true as const, n, prime, factors, remaining, divs };
		} catch (e) {
			return { ok: false as const, error: "Invalid integer." };
		}
	});

	function formatFactors(map: Map<bigint, number>): string {
		const parts: string[] = [];
		for (const [p, e] of [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
			parts.push(e === 1 ? `${p}` : `${p}^${e}`);
		}
		return parts.join(" × ");
	}

	let aInput = $state("12");
	let bInput = $state("18");
	let pairResult = $derived.by(() => {
		try {
			const a = BigInt(aInput);
			const b = BigInt(bInput);
			return {
				ok: true as const,
				gcd: gcd(a, b),
				lcm: lcm(a, b)
			};
		} catch {
			return { ok: false as const, error: "Invalid integers." };
		}
	});
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
		<h1 class="text-3xl font-bold tracking-tight">Number Factorizer</h1>
		<p class="text-muted-foreground mt-1">
			Prime check, factorization, divisors, and GCD/LCM with BigInt support.
		</p>
	</header>

	<Tabs.Root value="single">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="single">Factorize</Tabs.Trigger>
			<Tabs.Trigger value="pair">GCD / LCM</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="single">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Number</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Input bind:value={nInput} class="font-mono" />

					{#if result?.ok}
						<div class="bg-muted rounded-md p-3 text-sm">
							<div class="flex items-center gap-2">
								{#if result.prime}
									<CheckCircle class="h-5 w-5 text-emerald-500" />
									<span class="font-semibold">{result.n} is prime</span>
								{:else if result.n === 1n}
									<span class="font-semibold">{result.n} is the unit</span>
								{:else}
									<XCircle class="text-destructive h-5 w-5" />
									<span class="font-semibold">{result.n} is composite</span>
								{/if}
							</div>
							{#if !result.prime && result.factors.size > 0}
								<p class="mt-2 font-mono">
									<span class="text-muted-foreground">Prime factorization:</span>
									{result.n} = {formatFactors(result.factors)}{result.remaining
										? ` × (large factor ${result.remaining})`
										: ""}
								</p>
							{/if}
							{#if result.divs}
								<details class="mt-2">
									<summary class="cursor-pointer text-xs">Show {result.divs.length} divisors</summary>
									<p class="mt-1 max-h-32 overflow-auto font-mono text-xs">
										{result.divs.join(", ")}
									</p>
								</details>
							{/if}
						</div>
					{:else if result && !result.ok}
						<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
							{result.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="pair">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Two integers</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="a">A</Label>
							<Input id="a" bind:value={aInput} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="b">B</Label>
							<Input id="b" bind:value={bInput} class="font-mono" />
						</div>
					</div>
					{#if pairResult.ok}
						<div class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3">
							<div>
								<p class="text-muted-foreground text-xs">GCD</p>
								<p class="font-mono">{pairResult.gcd}</p>
							</div>
							<div>
								<p class="text-muted-foreground text-xs">LCM</p>
								<p class="font-mono">{pairResult.lcm}</p>
							</div>
						</div>
					{:else}
						<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
							{pairResult.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
