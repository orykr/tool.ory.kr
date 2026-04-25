<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Minus from "@lucide/svelte/icons/minus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	type Counter = { id: number; name: string; count: number };

	let counters = $state<Counter[]>([{ id: 1, name: "Counter", count: 0 }]);
	let nextId = 2;
	let step = $state(1);

	function addCounter() {
		counters = [...counters, { id: nextId++, name: `Counter ${counters.length + 1}`, count: 0 }];
	}

	function removeCounter(id: number) {
		counters = counters.filter((c) => c.id !== id);
	}

	function inc(i: number) {
		counters[i].count += step;
	}

	function dec(i: number) {
		counters[i].count -= step;
	}

	function resetAll() {
		counters = counters.map((c) => ({ ...c, count: 0 }));
	}

	function resetOne(i: number) {
		counters[i].count = 0;
	}

	let total = $derived(counters.reduce((acc, c) => acc + c.count, 0));
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
		<h1 class="text-3xl font-bold tracking-tight">Tally Counter</h1>
		<p class="text-muted-foreground mt-1">
			Track multiple counts with adjustable step size.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap items-end justify-between gap-3 pt-6">
			<div class="space-y-1.5">
				<Label for="step">Step</Label>
				<Input id="step" type="number" min="1" bind:value={step} class="w-24 font-mono" />
			</div>
			<div class="flex gap-2">
				<Button variant="outline" onclick={addCounter}>
					<Plus />
					Add counter
				</Button>
				<Button variant="ghost" onclick={resetAll}>
					<RefreshCw />
					Reset all
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="space-y-3">
		{#each counters as c, i (c.id)}
			<Card.Root>
				<Card.Content class="flex items-center gap-3 pt-6">
					<Input
						bind:value={counters[i].name}
						class="w-40 font-medium"
						placeholder="Name"
					/>
					<div class="flex flex-1 items-center justify-center gap-3">
						<Button variant="outline" size="icon" onclick={() => dec(i)}>
							<Minus />
						</Button>
						<span class="font-mono text-3xl font-bold tabular-nums">{c.count}</span>
						<Button onclick={() => inc(i)}>
							<Plus />
						</Button>
					</div>
					<Button variant="ghost" size="sm" onclick={() => resetOne(i)}>Reset</Button>
					<Button variant="ghost" size="icon" onclick={() => removeCounter(c.id)} disabled={counters.length === 1}>
						<Trash2 />
					</Button>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	{#if counters.length > 1}
		<Card.Root class="mt-4">
			<Card.Content class="flex items-center justify-between pt-6">
				<span class="font-semibold">Total</span>
				<span class="font-mono text-2xl font-bold">{total}</span>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
