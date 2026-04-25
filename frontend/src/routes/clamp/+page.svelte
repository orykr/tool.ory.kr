<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let minSize = $state(16);
	let maxSize = $state(24);
	let minViewport = $state(360);
	let maxViewport = $state(1280);
	let basePx = $state(16);

	let result = $derived.by(() => {
		if (maxViewport === minViewport) return null;
		const slope = (maxSize - minSize) / (maxViewport - minViewport);
		const intercept = minSize - slope * minViewport;
		const slopeVw = slope * 100;
		const interceptRem = intercept / basePx;
		const minRem = minSize / basePx;
		const maxRem = maxSize / basePx;
		return {
			minRem,
			maxRem,
			slopeVw,
			interceptRem
		};
	});

	let css = $derived.by(() => {
		if (!result) return "";
		const fmt = (n: number, d = 4) => n.toFixed(d).replace(/\.?0+$/, "");
		const middle =
			result.interceptRem >= 0
				? `${fmt(result.interceptRem)}rem + ${fmt(result.slopeVw)}vw`
				: `${fmt(result.slopeVw)}vw - ${fmt(-result.interceptRem)}rem`;
		return `clamp(${fmt(result.minRem)}rem, ${middle}, ${fmt(result.maxRem)}rem)`;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(css);
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
		<h1 class="text-3xl font-bold tracking-tight">CSS clamp() Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build a fluid <code>clamp()</code> value that scales linearly between two viewports.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Range</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="min-size">Min size (px)</Label>
				<Input id="min-size" type="number" min="0" step="any" bind:value={minSize} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="max-size">Max size (px)</Label>
				<Input id="max-size" type="number" min="0" step="any" bind:value={maxSize} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="min-vp">Min viewport (px)</Label>
				<Input id="min-vp" type="number" min="100" bind:value={minViewport} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="max-vp">Max viewport (px)</Label>
				<Input id="max-vp" type="number" min="100" bind:value={maxViewport} class="font-mono" />
			</div>
			<div class="space-y-1.5 sm:col-span-2">
				<Label for="base-px">Root font size (px)</Label>
				<Input id="base-px" type="number" min="1" bind:value={basePx} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">CSS</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!css}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-sm whitespace-pre-wrap">{css || "Adjust inputs..."}</pre>
			<p class="text-muted-foreground mt-3 text-xs">
				Below {minViewport}px the size locks at {minSize}px; above {maxViewport}px it locks at {maxSize}px; in between it scales linearly.
			</p>
		</Card.Content>
	</Card.Root>
</main>
