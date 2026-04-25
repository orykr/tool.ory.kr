<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Mode =
		| "fibonacci"
		| "primes"
		| "squares"
		| "cubes"
		| "triangular"
		| "factorials"
		| "powers"
		| "arithmetic"
		| "geometric"
		| "lucas";

	const labels: Record<Mode, string> = {
		fibonacci: "Fibonacci",
		primes: "Prime numbers",
		squares: "Perfect squares",
		cubes: "Perfect cubes",
		triangular: "Triangular numbers",
		factorials: "Factorials",
		powers: "Powers of n",
		arithmetic: "Arithmetic progression",
		geometric: "Geometric progression",
		lucas: "Lucas numbers"
	};

	let mode = $state<Mode>("fibonacci");
	let count = $state(15);
	let base = $state(2);
	let start = $state(1);
	let step = $state(3);
	let ratio = $state(2);

	function isPrime(n: bigint): boolean {
		if (n < 2n) return false;
		if (n < 4n) return true;
		if (n % 2n === 0n) return false;
		for (let i = 3n; i * i <= n; i += 2n) {
			if (n % i === 0n) return false;
		}
		return true;
	}

	let sequence = $derived.by(() => {
		const c = Math.max(1, Math.min(500, Math.floor(count) || 1));
		const result: bigint[] = [];
		switch (mode) {
			case "fibonacci": {
				let a = 0n;
				let b = 1n;
				for (let i = 0; i < c; i++) {
					result.push(a);
					[a, b] = [b, a + b];
				}
				break;
			}
			case "lucas": {
				let a = 2n;
				let b = 1n;
				for (let i = 0; i < c; i++) {
					result.push(a);
					[a, b] = [b, a + b];
				}
				break;
			}
			case "primes": {
				let n = 2n;
				while (result.length < c) {
					if (isPrime(n)) result.push(n);
					n++;
				}
				break;
			}
			case "squares":
				for (let i = 1; i <= c; i++) result.push(BigInt(i) * BigInt(i));
				break;
			case "cubes":
				for (let i = 1; i <= c; i++) result.push(BigInt(i) * BigInt(i) * BigInt(i));
				break;
			case "triangular":
				for (let i = 1; i <= c; i++) result.push((BigInt(i) * BigInt(i + 1)) / 2n);
				break;
			case "factorials": {
				let f = 1n;
				for (let i = 0; i < c; i++) {
					if (i === 0) result.push(1n);
					else {
						f *= BigInt(i);
						result.push(f);
					}
				}
				break;
			}
			case "powers": {
				const b = BigInt(Math.floor(base) || 2);
				let v = 1n;
				for (let i = 0; i < c; i++) {
					result.push(v);
					v *= b;
				}
				break;
			}
			case "arithmetic": {
				const s = BigInt(Math.floor(start) || 0);
				const d = BigInt(Math.floor(step) || 1);
				let v = s;
				for (let i = 0; i < c; i++) {
					result.push(v);
					v += d;
				}
				break;
			}
			case "geometric": {
				const s = BigInt(Math.floor(start) || 1);
				const r = BigInt(Math.floor(ratio) || 2);
				let v = s;
				for (let i = 0; i < c; i++) {
					result.push(v);
					v *= r;
				}
				break;
			}
		}
		return result;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(sequence.map(String).join(", "));
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Number Sequence Generator</h1>
		<p class="text-muted-foreground mt-1">
			Fibonacci, primes, squares, factorials, arithmetic / geometric, and more — using BigInt.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="md">Sequence</Label>
					<Select.Root type="single" bind:value={mode as never}>
						<Select.Trigger id="md" class="w-full">{labels[mode]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(labels) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="cn">Count (1–500)</Label>
					<Input id="cn" type="number" min="1" max="500" bind:value={count} class="font-mono" />
				</div>
				{#if mode === "powers"}
					<div class="space-y-1.5">
						<Label for="bs">Base</Label>
						<Input id="bs" type="number" bind:value={base} class="font-mono" />
					</div>
				{:else if mode === "arithmetic"}
					<div class="space-y-1.5">
						<Label for="st">Start</Label>
						<Input id="st" type="number" bind:value={start} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="sp">Common difference</Label>
						<Input id="sp" type="number" bind:value={step} class="font-mono" />
					</div>
				{:else if mode === "geometric"}
					<div class="space-y-1.5">
						<Label for="g1">Start</Label>
						<Input id="g1" type="number" bind:value={start} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="g2">Common ratio</Label>
						<Input id="g2" type="number" bind:value={ratio} class="font-mono" />
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Sequence</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!sequence.length}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{sequence.map(String).join(", ")}</pre>
		</Card.Content>
	</Card.Root>
</main>
