<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let p1x = $state(0.42);
	let p1y = $state(0);
	let p2x = $state(0.58);
	let p2y = $state(1);

	const presets = [
		{ name: "linear", v: [0, 0, 1, 1] },
		{ name: "ease", v: [0.25, 0.1, 0.25, 1] },
		{ name: "ease-in", v: [0.42, 0, 1, 1] },
		{ name: "ease-out", v: [0, 0, 0.58, 1] },
		{ name: "ease-in-out", v: [0.42, 0, 0.58, 1] },
		{ name: "snappy", v: [0.7, 0, 0.3, 1] },
		{ name: "bounce-out", v: [0.34, 1.56, 0.64, 1] }
	];

	function applyPreset(v: number[]) {
		[p1x, p1y, p2x, p2y] = v;
	}

	const SIZE = 280;
	const PAD = 30;

	function toPx(x: number, y: number): { x: number; y: number } {
		return {
			x: PAD + x * (SIZE - 2 * PAD),
			y: PAD + (1 - y) * (SIZE - 2 * PAD)
		};
	}

	let curve = $derived.by(() => {
		const start = toPx(0, 0);
		const c1 = toPx(p1x, p1y);
		const c2 = toPx(p2x, p2y);
		const end = toPx(1, 1);
		return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
	});

	let p1Px = $derived(toPx(p1x, p1y));
	let p2Px = $derived(toPx(p2x, p2y));

	let cssValue = $derived(
		`cubic-bezier(${p1x}, ${p1y}, ${p2x}, ${p2y})`
	);

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(cssValue);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	let animating = $state(false);
	function trigger() {
		animating = false;
		setTimeout(() => (animating = true), 50);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Cubic-Bezier Visualizer</h1>
		<p class="text-muted-foreground mt-1">
			Build and preview a CSS <code>cubic-bezier()</code> easing curve.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-[320px_1fr]">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Curve</Card.Title></Card.Header>
			<Card.Content>
				<svg viewBox="0 0 {SIZE} {SIZE}" class="bg-background w-full rounded-md border">
					<line x1={PAD} y1={SIZE - PAD} x2={SIZE - PAD} y2={SIZE - PAD} class="stroke-border" stroke-width="1" />
					<line x1={PAD} y1={PAD} x2={PAD} y2={SIZE - PAD} class="stroke-border" stroke-width="1" />
					<line x1={toPx(0, 0).x} y1={toPx(0, 0).y} x2={p1Px.x} y2={p1Px.y} class="stroke-border" stroke-dasharray="3 3" stroke-width="1" />
					<line x1={toPx(1, 1).x} y1={toPx(1, 1).y} x2={p2Px.x} y2={p2Px.y} class="stroke-border" stroke-dasharray="3 3" stroke-width="1" />
					<path d={curve} class="stroke-primary fill-none" stroke-width="2" />
					<circle cx={p1Px.x} cy={p1Px.y} r="6" class="fill-primary" />
					<circle cx={p2Px.x} cy={p2Px.y} r="6" class="fill-primary" />
					<circle cx={toPx(0, 0).x} cy={toPx(0, 0).y} r="3" class="fill-foreground" />
					<circle cx={toPx(1, 1).x} cy={toPx(1, 1).y} r="3" class="fill-foreground" />
				</svg>
			</Card.Content>
		</Card.Root>

		<div class="space-y-4">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Control points</Card.Title></Card.Header>
				<Card.Content>
					<div class="grid grid-cols-4 gap-2">
						<div class="space-y-1.5">
							<Label class="text-xs">P1.x</Label>
							<Input type="number" step="0.01" bind:value={p1x} class="h-8 font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label class="text-xs">P1.y</Label>
							<Input type="number" step="0.01" bind:value={p1y} class="h-8 font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label class="text-xs">P2.x</Label>
							<Input type="number" step="0.01" bind:value={p2x} class="h-8 font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label class="text-xs">P2.y</Label>
							<Input type="number" step="0.01" bind:value={p2y} class="h-8 font-mono" />
						</div>
					</div>

					<div class="mt-3 flex flex-wrap gap-1">
						{#each presets as p (p.name)}
							<button
								type="button"
								class="bg-background hover:bg-muted rounded border px-2 py-0.5 font-mono text-xs"
								onclick={() => applyPreset(p.v)}
							>
								{p.name}
							</button>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">CSS</Card.Title>
					<Button variant="ghost" size="sm" onclick={copy}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">{cssValue}</pre>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Preview</Card.Title>
					<Button variant="outline" size="sm" onclick={trigger}>Animate</Button>
				</Card.Header>
				<Card.Content>
					<div class="bg-muted h-12 w-full overflow-hidden rounded-md p-1">
						<div
							class="bg-primary h-10 w-10 rounded"
							style="transform: translateX({animating ? "calc(100% * 6.5)" : "0"}); transition: transform 1.4s {cssValue};"
						></div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</main>
