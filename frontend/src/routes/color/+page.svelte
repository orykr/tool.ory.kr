<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import {
		parseColor,
		rgbToHsl,
		rgbToHex,
		rgbToCss,
		hslToCss,
		contrastRatio,
		type RGB
	} from "$lib/color";

	let input = $state("#0070f3");
	let parsed = $derived(parseColor(input));
	let hsl = $derived(parsed ? rgbToHsl(parsed) : null);

	const WHITE: RGB = { r: 255, g: 255, b: 255, a: 1 };
	const BLACK: RGB = { r: 0, g: 0, b: 0, a: 1 };

	let representations = $derived(
		parsed && hsl
			? [
					{ key: "HEX", value: rgbToHex(parsed).toUpperCase() },
					{ key: "RGB", value: rgbToCss(parsed) },
					{ key: "HSL", value: hslToCss(hsl) }
				]
			: []
	);

	let copied = $state<string | null>(null);
	async function copy(label: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = label;
		setTimeout(() => (copied = null), 1200);
	}

	function pickColor(event: Event) {
		input = (event.target as HTMLInputElement).value;
	}

	let pickerValue = $derived(parsed ? rgbToHex(parsed).slice(0, 7) : "#000000");

	function passes(ratio: number, large: boolean) {
		const aa = large ? 3 : 4.5;
		const aaa = large ? 4.5 : 7;
		if (ratio >= aaa) return "AAA";
		if (ratio >= aa) return "AA";
		return "Fail";
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
		<h1 class="text-3xl font-bold tracking-tight">Color Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between HEX, RGB, and HSL, and check WCAG contrast against black & white.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Input</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex flex-wrap items-end gap-3">
				<div class="flex-1 space-y-1.5">
					<Label for="color-input">CSS color</Label>
					<Input
						id="color-input"
						bind:value={input}
						placeholder="#0070f3, rgb(0,112,243), hsl(212 95% 48%)"
						class="font-mono"
					/>
				</div>
				<div class="space-y-1.5">
					<Label for="color-picker">Pick</Label>
					<input
						id="color-picker"
						type="color"
						value={pickerValue}
						oninput={pickColor}
						class="h-10 w-14 cursor-pointer rounded-md border"
					/>
				</div>
			</div>

			{#if !parsed}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
				>
					Could not parse color. Try formats like <code>#abc</code>, <code>#aabbcc</code>,
					<code>rgb(...)</code>, or <code>hsl(...)</code>.
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if parsed && hsl}
		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title class="text-base">Preview</Card.Title>
			</Card.Header>
			<Card.Content>
				<div
					class="flex h-32 items-center justify-center rounded-md border"
					style="background-color: {rgbToCss(parsed)}"
				>
					<span class="font-mono text-sm" style="color: {parsed.r * 0.299 + parsed.g * 0.587 + parsed.b * 0.114 > 150 ? '#000' : '#fff'}">
						{rgbToHex(parsed).toUpperCase()}
					</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title class="text-base">Representations</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each representations as rep (rep.key)}
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<div>
							<p class="text-muted-foreground text-xs font-semibold">{rep.key}</p>
							<p class="font-mono text-sm">{rep.value}</p>
						</div>
						<Button variant="ghost" size="sm" onclick={() => copy(rep.key, rep.value)}>
							{#if copied === rep.key}
								<Check />
								Copied
							{:else}
								<Copy />
								Copy
							{/if}
						</Button>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">WCAG Contrast</Card.Title>
				<Card.Description>Ratios against pure white and pure black.</Card.Description>
			</Card.Header>
			<Card.Content>
				{@const wRatio = contrastRatio(parsed, WHITE)}
				{@const bRatio = contrastRatio(parsed, BLACK)}
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="bg-muted rounded-md p-3 text-sm">
						<p class="text-muted-foreground text-xs">vs. White</p>
						<p class="font-mono">{wRatio.toFixed(2)} : 1</p>
						<p class="text-muted-foreground mt-1 text-xs">
							Normal: {passes(wRatio, false)} · Large: {passes(wRatio, true)}
						</p>
					</div>
					<div class="bg-muted rounded-md p-3 text-sm">
						<p class="text-muted-foreground text-xs">vs. Black</p>
						<p class="font-mono">{bRatio.toFixed(2)} : 1</p>
						<p class="text-muted-foreground mt-1 text-xs">
							Normal: {passes(bRatio, false)} · Large: {passes(bRatio, true)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
