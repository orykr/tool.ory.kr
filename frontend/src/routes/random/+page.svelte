<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Coins from "@lucide/svelte/icons/coins";
	import Dices from "@lucide/svelte/icons/dices";

	function randInt(min: number, max: number): number {
		const range = max - min + 1;
		if (range <= 0) return min;
		if (range > 0xffffffff) {
			const buf = new BigUint64Array(1);
			const big = BigInt(range);
			const limit = (1n << 64n) - ((1n << 64n) % big);
			let v: bigint;
			do {
				crypto.getRandomValues(buf);
				v = buf[0];
			} while (v >= limit);
			return min + Number(v % big);
		}
		const buf = new Uint32Array(1);
		const limit = Math.floor(0x100000000 / range) * range;
		let v: number;
		do {
			crypto.getRandomValues(buf);
			v = buf[0];
		} while (v >= limit);
		return min + (v % range);
	}

	let numMin = $state(1);
	let numMax = $state(100);
	let numCount = $state(5);
	let numUnique = $state(false);
	let numbers = $state<number[]>([]);

	function generateNumbers() {
		const min = Math.min(numMin, numMax);
		const max = Math.max(numMin, numMax);
		const count = Math.max(1, Math.min(1000, Math.floor(numCount) || 1));
		const result: number[] = [];
		if (numUnique) {
			const range = max - min + 1;
			if (count > range) {
				numbers = [];
				return;
			}
			const seen = new Set<number>();
			while (seen.size < count) seen.add(randInt(min, max));
			result.push(...seen);
		} else {
			for (let i = 0; i < count; i++) result.push(randInt(min, max));
		}
		numbers = result;
	}

	let coinSides = $state<("H" | "T")[]>([]);
	function flipCoin(n = 1) {
		const r: ("H" | "T")[] = [];
		for (let i = 0; i < n; i++) r.push(randInt(0, 1) === 0 ? "H" : "T");
		coinSides = r;
	}

	let diceSides = $state(6);
	let diceCount = $state(2);
	let diceRolls = $state<number[]>([]);
	function rollDice() {
		const r: number[] = [];
		const sides = Math.max(2, Math.min(100, Math.floor(diceSides) || 6));
		const count = Math.max(1, Math.min(20, Math.floor(diceCount) || 1));
		for (let i = 0; i < count; i++) r.push(randInt(1, sides));
		diceRolls = r;
	}

	let pickList = $state("Alice\nBob\nCharlie\nDana");
	let pickCount = $state(1);
	let picked = $state<string[]>([]);
	function pick() {
		const items = pickList.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
		if (!items.length) {
			picked = [];
			return;
		}
		const count = Math.max(1, Math.min(items.length, Math.floor(pickCount) || 1));
		const remaining = [...items];
		const result: string[] = [];
		for (let i = 0; i < count; i++) {
			const idx = randInt(0, remaining.length - 1);
			result.push(remaining[idx]);
			remaining.splice(idx, 1);
		}
		picked = result;
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
		<h1 class="text-3xl font-bold tracking-tight">Random Generator</h1>
		<p class="text-muted-foreground mt-1">
			Numbers, dice, coin flips, and random picks — all with crypto-grade entropy.
		</p>
	</header>

	<Tabs.Root value="numbers">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="numbers">Numbers</Tabs.Trigger>
			<Tabs.Trigger value="dice">Dice</Tabs.Trigger>
			<Tabs.Trigger value="coin">Coin</Tabs.Trigger>
			<Tabs.Trigger value="picker">Picker</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="numbers">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Random Numbers</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-3 sm:grid-cols-3">
						<div class="space-y-1.5">
							<Label for="rn-min">Min</Label>
							<Input id="rn-min" type="number" bind:value={numMin} />
						</div>
						<div class="space-y-1.5">
							<Label for="rn-max">Max</Label>
							<Input id="rn-max" type="number" bind:value={numMax} />
						</div>
						<div class="space-y-1.5">
							<Label for="rn-count">Count</Label>
							<Input id="rn-count" type="number" min="1" max="1000" bind:value={numCount} />
						</div>
					</div>
					<label class="flex cursor-pointer items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={numUnique} class="h-4 w-4 rounded border" />
						Unique values only
					</label>
					<Button onclick={generateNumbers}>
						<RefreshCw />
						Generate
					</Button>
					{#if numbers.length}
						<p class="bg-muted rounded-md p-3 font-mono text-sm break-all">
							{numbers.join(", ")}
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="dice">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Dice Roll</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="d-sides">Sides</Label>
							<Input id="d-sides" type="number" min="2" max="100" bind:value={diceSides} />
						</div>
						<div class="space-y-1.5">
							<Label for="d-count">Dice</Label>
							<Input id="d-count" type="number" min="1" max="20" bind:value={diceCount} />
						</div>
					</div>
					<Button onclick={rollDice}>
						<Dices />
						Roll
					</Button>
					{#if diceRolls.length}
						<p class="bg-muted rounded-md p-3 font-mono text-sm">
							{diceRolls.join(", ")} <span class="text-muted-foreground">(sum: {diceRolls.reduce((a, b) => a + b, 0)})</span>
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="coin">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Coin Flip</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex gap-2">
						<Button onclick={() => flipCoin(1)}>
							<Coins />
							1 flip
						</Button>
						<Button variant="outline" onclick={() => flipCoin(10)}>10 flips</Button>
						<Button variant="outline" onclick={() => flipCoin(100)}>100 flips</Button>
					</div>
					{#if coinSides.length}
						<p class="bg-muted rounded-md p-3 font-mono text-sm break-all">
							{coinSides.join(" ")}
						</p>
						{#if coinSides.length > 1}
							<p class="text-muted-foreground text-xs">
								Heads: {coinSides.filter((c) => c === "H").length} · Tails: {coinSides.filter((c) => c === "T").length}
							</p>
						{/if}
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="picker">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Random Picker</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label for="pick-list">Items (one per line)</Label>
						<Textarea id="pick-list" bind:value={pickList} class="min-h-32 font-mono text-sm" />
					</div>
					<div class="space-y-1.5">
						<Label for="pick-count">Pick count</Label>
						<Input id="pick-count" type="number" min="1" bind:value={pickCount} class="w-32" />
					</div>
					<Button onclick={pick}>
						<RefreshCw />
						Pick
					</Button>
					{#if picked.length}
						<ul class="bg-muted space-y-1 rounded-md p-3 text-sm">
							{#each picked as p, i (i)}
								<li class="font-mono">{p}</li>
							{/each}
						</ul>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
