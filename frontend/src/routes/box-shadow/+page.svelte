<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Layer = {
		id: number;
		x: number;
		y: number;
		blur: number;
		spread: number;
		color: string;
		alpha: number;
		inset: boolean;
	};

	let layers = $state<Layer[]>([
		{ id: 1, x: 0, y: 4, blur: 6, spread: -1, color: "#000000", alpha: 0.1, inset: false },
		{ id: 2, x: 0, y: 2, blur: 4, spread: -2, color: "#000000", alpha: 0.06, inset: false }
	]);
	let nextId = 3;

	let bgColor = $state("#f8fafc");
	let blockColor = $state("#ffffff");
	let radius = $state([12]);

	function addLayer() {
		layers = [
			...layers,
			{ id: nextId++, x: 0, y: 4, blur: 8, spread: 0, color: "#000000", alpha: 0.15, inset: false }
		];
	}
	function removeLayer(id: number) {
		layers = layers.filter((l) => l.id !== id);
	}

	function rgba(hex: string, alpha: number): string {
		const m = hex.match(/^#?([0-9a-f]{6})$/i);
		if (!m) return `rgba(0,0,0,${alpha})`;
		const n = parseInt(m[1], 16);
		const r = (n >> 16) & 0xff;
		const g = (n >> 8) & 0xff;
		const b = n & 0xff;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	let css = $derived(
		layers
			.map(
				(l) =>
					`${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, l.alpha)}`
			)
			.join(",\n        ")
	);

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(`box-shadow: ${css};`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">CSS Box Shadow Generator</h1>
		<p class="text-muted-foreground mt-1">
			Stack multiple shadow layers and copy the generated CSS.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-[1fr_360px]">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Preview</Card.Title>
			</Card.Header>
			<Card.Content>
				<div
					class="flex h-72 items-center justify-center rounded-md"
					style="background-color: {bgColor}"
				>
					<div
						style="width: 160px; height: 160px; background-color: {blockColor}; border-radius: {radius[0]}px; box-shadow: {css};"
					></div>
				</div>
				<div class="mt-3 grid grid-cols-3 gap-2">
					<div class="space-y-1">
						<Label for="bg">Background</Label>
						<input id="bg" type="color" bind:value={bgColor} class="h-8 w-full cursor-pointer rounded border" />
					</div>
					<div class="space-y-1">
						<Label for="bk">Block</Label>
						<input id="bk" type="color" bind:value={blockColor} class="h-8 w-full cursor-pointer rounded border" />
					</div>
					<div class="space-y-1">
						<Label>Radius {radius[0]}px</Label>
						<Slider type="single" bind:value={radius} min={0} max={80} step={1} />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Layers</Card.Title>
				<Button variant="outline" size="sm" onclick={addLayer}>
					<Plus />
					Add
				</Button>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each layers as l, i (l.id)}
						<div class="border-l-2 pl-3">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-xs">Layer {i + 1}</span>
								<Button variant="ghost" size="icon" onclick={() => removeLayer(l.id)}>
									<Trash2 />
								</Button>
							</div>
							<div class="grid grid-cols-2 gap-2 text-xs">
								<label>X
									<Input type="number" bind:value={layers[i].x} class="h-7 font-mono" />
								</label>
								<label>Y
									<Input type="number" bind:value={layers[i].y} class="h-7 font-mono" />
								</label>
								<label>Blur
									<Input type="number" min="0" bind:value={layers[i].blur} class="h-7 font-mono" />
								</label>
								<label>Spread
									<Input type="number" bind:value={layers[i].spread} class="h-7 font-mono" />
								</label>
								<label>Color
									<input type="color" bind:value={layers[i].color} class="h-7 w-full cursor-pointer rounded border" />
								</label>
								<label>Alpha
									<Input type="number" min="0" max="1" step="0.05" bind:value={layers[i].alpha} class="h-7 font-mono" />
								</label>
							</div>
							<label class="mt-1 flex cursor-pointer items-center gap-2 text-xs">
								<input type="checkbox" bind:checked={layers[i].inset} class="h-3 w-3 rounded border" />
								Inset
							</label>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root class="mt-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">CSS</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">box-shadow: {css};</pre>
		</Card.Content>
	</Card.Root>
</main>
