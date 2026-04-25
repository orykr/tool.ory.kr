<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let origW = $state(1920);
	let origH = $state(1080);
	let newW = $state<number | null>(1280);
	let newH = $state<number | null>(null);
	let lastEdited: "w" | "h" = "w";

	function gcd(a: number, b: number): number {
		a = Math.abs(Math.round(a));
		b = Math.abs(Math.round(b));
		while (b) {
			[a, b] = [b, a % b];
		}
		return a || 1;
	}

	let ratio = $derived.by(() => {
		const w = Math.round(origW);
		const h = Math.round(origH);
		if (w <= 0 || h <= 0) return null;
		const g = gcd(w, h);
		return { w: w / g, h: h / g, decimal: w / h };
	});

	function recompute(edited: "w" | "h") {
		lastEdited = edited;
		if (!ratio) return;
		if (edited === "w" && newW != null && newW > 0) {
			newH = Math.round((newW * origH) / origW);
		} else if (edited === "h" && newH != null && newH > 0) {
			newW = Math.round((newH * origW) / origH);
		}
	}

	$effect(() => {
		void origW;
		void origH;
		recompute(lastEdited);
	});

	const presets = [
		{ name: "16:9 (HD)", w: 1920, h: 1080 },
		{ name: "16:10", w: 1920, h: 1200 },
		{ name: "4:3", w: 1024, h: 768 },
		{ name: "21:9 (UltraWide)", w: 2560, h: 1080 },
		{ name: "1:1 (Square)", w: 1080, h: 1080 },
		{ name: "9:16 (Portrait)", w: 1080, h: 1920 },
		{ name: "3:2 (Photo)", w: 3000, h: 2000 },
		{ name: "2:3 (Portrait Photo)", w: 2000, h: 3000 }
	];

	function applyPreset(p: { w: number; h: number }) {
		origW = p.w;
		origH = p.h;
		newW = Math.round(p.w / 1.5);
		newH = Math.round(p.h / 1.5);
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
		<h1 class="text-3xl font-bold tracking-tight">Aspect Ratio Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Compute aspect ratios and resize dimensions while preserving them.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Original size</Card.Title></Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="ow">Width</Label>
					<Input id="ow" type="number" min="1" bind:value={origW} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="oh">Height</Label>
					<Input id="oh" type="number" min="1" bind:value={origH} class="font-mono" />
				</div>
			</div>

			{#if ratio}
				<div class="bg-muted mt-3 rounded-md p-3">
					<p class="font-mono text-lg">
						<span class="font-semibold">{ratio.w}:{ratio.h}</span>
						<span class="text-muted-foreground ml-3 text-sm">
							= {ratio.decimal.toFixed(4)}
						</span>
					</p>
				</div>
			{/if}

			<div class="mt-3 flex flex-wrap gap-1">
				{#each presets as p (p.name)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-1 text-xs"
						onclick={() => applyPreset(p)}
					>
						{p.name}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Resize</Card.Title></Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="nw">Width</Label>
					<Input
						id="nw"
						type="number"
						min="1"
						bind:value={newW}
						oninput={() => recompute("w")}
						class="font-mono"
					/>
				</div>
				<div class="space-y-1.5">
					<Label for="nh">Height</Label>
					<Input
						id="nh"
						type="number"
						min="1"
						bind:value={newH}
						oninput={() => recompute("h")}
						class="font-mono"
					/>
				</div>
			</div>

			{#if newW && newH}
				<div class="bg-muted mt-3 flex justify-center rounded-md p-3">
					<div
						class="bg-background border-primary border-2"
						style="width: 240px; height: {(240 * newH) / newW}px; max-height: 200px;"
					></div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
