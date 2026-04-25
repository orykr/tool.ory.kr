<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let input = $state(`alice 3
bob 1
carol 2
dave
eve 5`);
	let pickCount = $state(3);
	let withReplacement = $state(false);
	let counter = $state(0);
	let picked = $state<string[]>([]);

	type Item = { value: string; weight: number };

	function parse(text: string): Item[] {
		const items: Item[] = [];
		for (const raw of text.split(/\r?\n/)) {
			const line = raw.trim();
			if (!line) continue;
			const m = line.match(/^(.*?)(?:[\s,]+(\d+(?:\.\d+)?))?$/);
			if (m) {
				const value = m[1].trim();
				const w = m[2] ? Number(m[2]) : 1;
				if (value) items.push({ value, weight: Number.isFinite(w) && w > 0 ? w : 1 });
			}
		}
		return items;
	}

	let items = $derived(parse(input));

	function randomFloat(): number {
		const buf = new Uint32Array(1);
		crypto.getRandomValues(buf);
		return buf[0] / 0x100000000;
	}

	function pickWeighted(pool: Item[]): Item | null {
		const total = pool.reduce((s, p) => s + p.weight, 0);
		if (total <= 0) return null;
		let r = randomFloat() * total;
		for (const item of pool) {
			r -= item.weight;
			if (r <= 0) return item;
		}
		return pool[pool.length - 1];
	}

	function pick() {
		const result: string[] = [];
		const count = Math.max(1, Math.min(1000, Math.floor(pickCount) || 1));
		let pool = items.slice();
		for (let i = 0; i < count && pool.length > 0; i++) {
			const item = pickWeighted(pool);
			if (!item) break;
			result.push(item.value);
			if (!withReplacement) pool = pool.filter((p) => p !== item);
		}
		picked = result;
		counter++;
	}

	$effect(() => {
		void input;
		void withReplacement;
		void pickCount;
		pick();
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(picked.join("\n"));
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
		<h1 class="text-3xl font-bold tracking-tight">Weighted Random Picker</h1>
		<p class="text-muted-foreground mt-1">
			Pick random items from a list with optional weights, with or without replacement.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Items</Card.Title>
			<Card.Description>
				One per line. Append a number to set weight (default 1): <code>alice 3</code>.
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="cn">Pick count</Label>
					<Input id="cn" type="number" min="1" max="1000" bind:value={pickCount} class="font-mono" />
				</div>
				<label class="flex cursor-pointer items-center gap-2 pt-6 text-sm">
					<input type="checkbox" bind:checked={withReplacement} class="h-4 w-4 rounded border" />
					Pick with replacement (allow duplicates)
				</label>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Picked</Card.Title>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={pick}>
					<RefreshCw />
					Repick
				</Button>
				<Button variant="ghost" size="sm" onclick={copy} disabled={!picked.length}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if picked.length}
				<ol class="space-y-1">
					{#each picked as p, i (i + p)}
						<li class="bg-muted flex justify-between rounded px-3 py-1 font-mono text-sm">
							<span><span class="text-muted-foreground mr-2">{i + 1}.</span>{p}</span>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-muted-foreground text-sm">No picks (empty list?).</p>
			{/if}
			{#if items.length}
				<p class="text-muted-foreground mt-3 text-xs">
					{items.length} items · total weight {items.reduce((s, p) => s + p.weight, 0)}
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
