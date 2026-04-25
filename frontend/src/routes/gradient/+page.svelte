<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Stop = { id: number; color: string; position: number };
	type Type = "linear" | "radial" | "conic";

	let stops = $state<Stop[]>([
		{ id: 1, color: "#7c3aed", position: 0 },
		{ id: 2, color: "#2563eb", position: 100 }
	]);
	let nextId = 3;
	let type = $state<Type>("linear");
	let angle = $state([135]);
	let shape = $state<"circle" | "ellipse">("ellipse");
	let position = $state("center");

	function addStop() {
		const last = stops[stops.length - 1];
		stops = [...stops, { id: nextId++, color: last?.color ?? "#000000", position: 100 }];
	}
	function removeStop(id: number) {
		if (stops.length <= 2) return;
		stops = stops.filter((s) => s.id !== id);
	}

	let sortedStops = $derived([...stops].sort((a, b) => a.position - b.position));

	let stopsText = $derived(
		sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ")
	);

	let css = $derived.by(() => {
		if (type === "linear") return `linear-gradient(${angle[0]}deg, ${stopsText})`;
		if (type === "radial") return `radial-gradient(${shape} at ${position}, ${stopsText})`;
		return `conic-gradient(from ${angle[0]}deg at ${position}, ${stopsText})`;
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(`background: ${css};`);
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
		<h1 class="text-3xl font-bold tracking-tight">CSS Gradient Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build linear, radial, or conic gradients with color stops.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-[1fr_360px]">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Preview</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="h-72 rounded-md border" style="background: {css}"></div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label for="grad-type">Type</Label>
					<Select.Root type="single" bind:value={type as never}>
						<Select.Trigger id="grad-type" class="w-full">{type}</Select.Trigger>
						<Select.Content>
							<Select.Item value="linear">Linear</Select.Item>
							<Select.Item value="radial">Radial</Select.Item>
							<Select.Item value="conic">Conic</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				{#if type === "linear" || type === "conic"}
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label>Angle</Label>
							<span class="text-muted-foreground text-xs">{angle[0]}°</span>
						</div>
						<Slider type="single" bind:value={angle} min={0} max={360} step={1} />
					</div>
				{/if}

				{#if type === "radial"}
					<div class="space-y-1.5">
						<Label for="grad-shape">Shape</Label>
						<Select.Root type="single" bind:value={shape as never}>
							<Select.Trigger id="grad-shape" class="w-full">{shape}</Select.Trigger>
							<Select.Content>
								<Select.Item value="circle">Circle</Select.Item>
								<Select.Item value="ellipse">Ellipse</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				{/if}

				{#if type === "radial" || type === "conic"}
					<div class="space-y-1.5">
						<Label for="grad-pos">Position</Label>
						<Input id="grad-pos" bind:value={position} class="font-mono" />
					</div>
				{/if}

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Color stops</Label>
						<Button variant="outline" size="sm" onclick={addStop}>
							<Plus />
							Add
						</Button>
					</div>
					{#each stops as s, i (s.id)}
						<div class="flex items-center gap-2">
							<input
								type="color"
								bind:value={stops[i].color}
								class="h-8 w-10 cursor-pointer rounded border"
							/>
							<Input
								type="number"
								min="0"
								max="100"
								bind:value={stops[i].position}
								class="h-8 w-16 font-mono"
							/>
							<span class="text-muted-foreground text-xs">%</span>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => removeStop(s.id)}
								disabled={stops.length <= 2}
							>
								<Trash2 />
							</Button>
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
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">background: {css};</pre>
		</Card.Content>
	</Card.Root>
</main>
