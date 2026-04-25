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

	type Style = "circle" | "dots" | "bars" | "pulse" | "ring";
	let style = $state<Style>("circle");
	let size = $state([48]);
	let thickness = $state([4]);
	let color = $state("#3b82f6");
	let trackColor = $state("#e5e7eb");
	let speed = $state([1]);

	let css = $derived.by(() => {
		const s = size[0];
		const t = thickness[0];
		const sp = speed[0];
		switch (style) {
			case "circle":
				return `.spinner {
  width: ${s}px;
  height: ${s}px;
  border: ${t}px solid ${trackColor};
  border-top-color: ${color};
  border-radius: 50%;
  animation: spinner-rotate ${sp}s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}`;
			case "ring":
				return `.spinner {
  width: ${s}px;
  height: ${s}px;
  border: ${t}px solid ${trackColor};
  border-bottom-color: transparent;
  border-radius: 50%;
  border-image: conic-gradient(from 0, ${color}, transparent) 1;
  animation: spinner-rotate ${sp}s linear infinite;
}
@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}`;
			case "dots":
				return `.spinner {
  display: inline-flex;
  gap: ${Math.max(2, t)}px;
}
.spinner span {
  width: ${Math.max(4, s / 4)}px;
  height: ${Math.max(4, s / 4)}px;
  background: ${color};
  border-radius: 50%;
  animation: spinner-bounce ${sp}s ease-in-out infinite;
}
.spinner span:nth-child(2) { animation-delay: ${(sp / 6).toFixed(3)}s; }
.spinner span:nth-child(3) { animation-delay: ${(sp / 3).toFixed(3)}s; }

@keyframes spinner-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}`;
			case "bars":
				return `.spinner {
  display: inline-flex;
  gap: ${Math.max(2, t)}px;
  align-items: center;
  height: ${s}px;
}
.spinner span {
  width: ${Math.max(2, t)}px;
  height: 100%;
  background: ${color};
  animation: spinner-stretch ${sp}s ease-in-out infinite;
}
.spinner span:nth-child(2) { animation-delay: ${(sp / 8).toFixed(3)}s; }
.spinner span:nth-child(3) { animation-delay: ${(sp / 4).toFixed(3)}s; }
.spinner span:nth-child(4) { animation-delay: ${((3 * sp) / 8).toFixed(3)}s; }

@keyframes spinner-stretch {
  0%, 40%, 100% { transform: scaleY(0.3); }
  20% { transform: scaleY(1); }
}`;
			case "pulse":
				return `.spinner {
  width: ${s}px;
  height: ${s}px;
  background: ${color};
  border-radius: 50%;
  animation: spinner-pulse ${sp}s ease-out infinite;
}

@keyframes spinner-pulse {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}`;
		}
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(css);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<svelte:head>
	{@html `<style>${css}</style>`}
</svelte:head>

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
		<h1 class="text-3xl font-bold tracking-tight">CSS Spinner Generator</h1>
		<p class="text-muted-foreground mt-1">
			Build pure-CSS loading indicators with adjustable size, color, and speed.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-[1fr_360px]">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Preview</Card.Title></Card.Header>
			<Card.Content class="flex h-72 items-center justify-center bg-white dark:bg-zinc-900">
				<div class="spinner">
					{#if style === "dots" || style === "bars"}
						<span></span>
						<span></span>
						<span></span>
						{#if style === "bars"}
							<span></span>
						{/if}
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="st">Style</Label>
					<Select.Root type="single" bind:value={style as never}>
						<Select.Trigger id="st" class="w-full">{style}</Select.Trigger>
						<Select.Content>
							<Select.Item value="circle">Circle</Select.Item>
							<Select.Item value="ring">Ring (gradient)</Select.Item>
							<Select.Item value="dots">Bouncing dots</Select.Item>
							<Select.Item value="bars">Bars</Select.Item>
							<Select.Item value="pulse">Pulse</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Size</Label>
						<span class="text-muted-foreground text-xs">{size[0]}px</span>
					</div>
					<Slider type="single" bind:value={size} min={16} max={120} step={2} />
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Thickness / gap</Label>
						<span class="text-muted-foreground text-xs">{thickness[0]}px</span>
					</div>
					<Slider type="single" bind:value={thickness} min={1} max={16} step={1} />
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Speed</Label>
						<span class="text-muted-foreground text-xs">{speed[0].toFixed(1)}s</span>
					</div>
					<Slider type="single" bind:value={speed} min={0.2} max={3} step={0.1} />
				</div>

				<div class="grid gap-2 sm:grid-cols-2">
					<div class="space-y-1">
						<Label for="cl">Color</Label>
						<input id="cl" type="color" bind:value={color} class="h-9 w-full cursor-pointer rounded border" />
					</div>
					<div class="space-y-1">
						<Label for="tc">Track</Label>
						<input id="tc" type="color" bind:value={trackColor} class="h-9 w-full cursor-pointer rounded border" />
					</div>
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
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{css}</pre>
		</Card.Content>
	</Card.Root>
</main>
