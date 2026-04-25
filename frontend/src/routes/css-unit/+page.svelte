<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let pixels = $state(16);
	let basePx = $state(16);
	let parentPx = $state(16);
	let viewportPx = $state(1280);
	let viewportHpx = $state(720);

	let conversions = $derived.by(() => {
		const px = pixels;
		const ratio96 = 96;
		return [
			{ unit: "px", value: px },
			{ unit: "rem", value: px / basePx },
			{ unit: "em", value: px / parentPx },
			{ unit: "pt", value: (px * 72) / ratio96 },
			{ unit: "pc", value: (px * 72) / ratio96 / 12 },
			{ unit: "in", value: px / ratio96 },
			{ unit: "cm", value: (px * 2.54) / ratio96 },
			{ unit: "mm", value: (px * 25.4) / ratio96 },
			{ unit: "vw", value: (px * 100) / viewportPx },
			{ unit: "vh", value: (px * 100) / viewportHpx },
			{ unit: "%", value: (px * 100) / parentPx }
		];
	});

	function fmt(n: number): string {
		if (!Number.isFinite(n)) return "—";
		const s = n.toFixed(6);
		return s.replace(/\.?0+$/, "");
	}

	let copied = $state<string | null>(null);
	async function copy(unit: string, value: number) {
		await navigator.clipboard.writeText(`${fmt(value)}${unit === "%" ? "%" : unit}`);
		copied = unit;
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
		<h1 class="text-3xl font-bold tracking-tight">CSS Unit Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert pixels to rem, em, pt, vw/vh, and physical units.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Inputs</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="px">Pixels</Label>
				<Input id="px" type="number" step="any" bind:value={pixels} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="base">Root font size (px)</Label>
				<Input id="base" type="number" min="1" bind:value={basePx} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="par">Parent font size (px)</Label>
				<Input id="par" type="number" min="1" bind:value={parentPx} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="vw">Viewport width (px)</Label>
				<Input id="vw" type="number" min="1" bind:value={viewportPx} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="vh">Viewport height (px)</Label>
				<Input id="vh" type="number" min="1" bind:value={viewportHpx} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Equivalents</Card.Title></Card.Header>
		<Card.Content>
			<dl class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each conversions as c (c.unit)}
					<div class="bg-muted flex items-center justify-between rounded-md p-2">
						<div>
							<dt class="text-muted-foreground text-xs">{c.unit}</dt>
							<dd class="font-mono text-sm">{fmt(c.value)}</dd>
						</div>
						<Button variant="ghost" size="sm" onclick={() => copy(c.unit, c.value)}>
							{#if copied === c.unit}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				{/each}
			</dl>
			<p class="text-muted-foreground mt-3 text-xs">
				Browser CSS uses 96 DPI: 1in = 96px = 72pt = 2.54cm = 25.4mm.
			</p>
		</Card.Content>
	</Card.Root>
</main>
