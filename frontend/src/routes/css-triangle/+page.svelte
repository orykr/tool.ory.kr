<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Direction = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";

	let direction = $state<Direction>("up");
	let width = $state(80);
	let height = $state(60);
	let color = $state("#3b82f6");

	const directionLabels: Record<Direction, string> = {
		up: "Up",
		down: "Down",
		left: "Left",
		right: "Right",
		"up-left": "Up-Left",
		"up-right": "Up-Right",
		"down-left": "Down-Left",
		"down-right": "Down-Right"
	};

	function buildBorders(dir: Direction, w: number, h: number, c: string): Record<string, string> {
		const transparent = "transparent";
		switch (dir) {
			case "up":
				return {
					"border-left": `${w / 2}px solid ${transparent}`,
					"border-right": `${w / 2}px solid ${transparent}`,
					"border-bottom": `${h}px solid ${c}`
				};
			case "down":
				return {
					"border-left": `${w / 2}px solid ${transparent}`,
					"border-right": `${w / 2}px solid ${transparent}`,
					"border-top": `${h}px solid ${c}`
				};
			case "left":
				return {
					"border-top": `${h / 2}px solid ${transparent}`,
					"border-bottom": `${h / 2}px solid ${transparent}`,
					"border-right": `${w}px solid ${c}`
				};
			case "right":
				return {
					"border-top": `${h / 2}px solid ${transparent}`,
					"border-bottom": `${h / 2}px solid ${transparent}`,
					"border-left": `${w}px solid ${c}`
				};
			case "up-left":
				return {
					"border-top": `${h}px solid ${c}`,
					"border-right": `${w}px solid ${transparent}`
				};
			case "up-right":
				return {
					"border-top": `${h}px solid ${c}`,
					"border-left": `${w}px solid ${transparent}`
				};
			case "down-left":
				return {
					"border-bottom": `${h}px solid ${c}`,
					"border-right": `${w}px solid ${transparent}`
				};
			case "down-right":
				return {
					"border-bottom": `${h}px solid ${c}`,
					"border-left": `${w}px solid ${transparent}`
				};
		}
	}

	let borders = $derived(buildBorders(direction, width, height, color));

	let cssText = $derived.by(() => {
		const lines: string[] = [];
		lines.push(".triangle {");
		lines.push("  width: 0;");
		lines.push("  height: 0;");
		for (const [k, v] of Object.entries(borders)) {
			lines.push(`  ${k}: ${v};`);
		}
		lines.push("}");
		return lines.join("\n");
	});

	let inlineStyle = $derived(
		`width: 0; height: 0; ${Object.entries(borders)
			.map(([k, v]) => `${k}: ${v}`)
			.join("; ")};`
	);

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(cssText);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">CSS Triangle</h1>
		<p class="text-muted-foreground mt-1">
			Generate CSS arrows / triangles using the classic transparent-border technique.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label for="dir">Direction</Label>
					<Select.Root type="single" bind:value={direction as never}>
						<Select.Trigger id="dir" class="w-full">{directionLabels[direction]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(directionLabels) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label>Width: {width}px</Label>
					<Slider type="single" min={1} max={400} step={1} value={width} onValueChange={(v) => (width = v)} />
				</div>
				<div>
					<Label>Height: {height}px</Label>
					<Slider type="single" min={1} max={400} step={1} value={height} onValueChange={(v) => (height = v)} />
				</div>
				<div class="space-y-1.5">
					<Label for="col">Color</Label>
					<div class="flex gap-2">
						<Input id="col" type="color" bind:value={color} class="h-10 w-16 cursor-pointer p-1" />
						<Input bind:value={color} class="font-mono" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">Preview</Card.Title></Card.Header>
			<Card.Content>
				<div class="bg-muted flex h-72 items-center justify-center rounded">
					<div style={inlineStyle}></div>
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
			<pre class="bg-muted overflow-auto rounded p-3 font-mono text-sm">{cssText}</pre>
		</Card.Content>
	</Card.Root>
</main>
