<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Stop = { color: string; weight: number };
	type Space = "rgb" | "linear" | "hsl";

	let stops = $state<Stop[]>([
		{ color: "#ff0000", weight: 1 },
		{ color: "#0000ff", weight: 1 }
	]);
	let space = $state<Space>("linear");

	const spaceLabels: Record<Space, string> = {
		rgb: "sRGB linear weighted (perceptual-ish)",
		linear: "Linear-light RGB (gamma-corrected)",
		hsl: "HSL (mean of components)"
	};

	function hexToRgb(hex: string): [number, number, number] | null {
		const m = hex.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
		if (!m) return null;
		let s = m[1];
		if (s.length === 3) s = s.split("").map((c) => c + c).join("");
		return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
	}

	function rgbToHex(r: number, g: number, b: number): string {
		const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
		return `#${h(r)}${h(g)}${h(b)}`;
	}

	function srgbToLinear(c: number): number {
		const s = c / 255;
		return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	}

	function linearToSrgb(c: number): number {
		const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
		return s * 255;
	}

	function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
		const rn = r / 255, gn = g / 255, bn = b / 255;
		const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
		const l = (max + min) / 2;
		let h = 0, s = 0;
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
			else if (max === gn) h = (bn - rn) / d + 2;
			else h = (rn - gn) / d + 4;
			h *= 60;
		}
		return [h, s, l];
	}

	function hslToRgb(h: number, s: number, l: number): [number, number, number] {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const hp = (((h % 360) + 360) % 360) / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r1 = 0, g1 = 0, b1 = 0;
		if (0 <= hp && hp < 1) [r1, g1, b1] = [c, x, 0];
		else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
		else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
		else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
		else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
		else [r1, g1, b1] = [c, 0, x];
		const m = l - c / 2;
		return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
	}

	function meanHue(hues: number[], weights: number[]): number {
		let x = 0, y = 0;
		for (let i = 0; i < hues.length; i++) {
			const rad = (hues[i] * Math.PI) / 180;
			x += Math.cos(rad) * weights[i];
			y += Math.sin(rad) * weights[i];
		}
		const angle = Math.atan2(y, x) * (180 / Math.PI);
		return (angle + 360) % 360;
	}

	let mixed = $derived.by(() => {
		const valid: Array<{ rgb: [number, number, number]; weight: number }> = [];
		for (const s of stops) {
			const rgb = hexToRgb(s.color);
			if (rgb && Number.isFinite(s.weight) && s.weight > 0) {
				valid.push({ rgb, weight: s.weight });
			}
		}
		if (valid.length === 0) return null;
		const total = valid.reduce((sum, v) => sum + v.weight, 0);

		if (space === "rgb") {
			let r = 0, g = 0, b = 0;
			for (const v of valid) {
				r += v.rgb[0] * v.weight;
				g += v.rgb[1] * v.weight;
				b += v.rgb[2] * v.weight;
			}
			return rgbToHex(r / total, g / total, b / total);
		}
		if (space === "linear") {
			let r = 0, g = 0, b = 0;
			for (const v of valid) {
				r += srgbToLinear(v.rgb[0]) * v.weight;
				g += srgbToLinear(v.rgb[1]) * v.weight;
				b += srgbToLinear(v.rgb[2]) * v.weight;
			}
			return rgbToHex(linearToSrgb(r / total), linearToSrgb(g / total), linearToSrgb(b / total));
		}
		const hsls = valid.map((v) => rgbToHsl(...v.rgb));
		const weights = valid.map((v) => v.weight);
		const h = meanHue(hsls.map((c) => c[0]), weights);
		let s = 0, l = 0;
		for (let i = 0; i < hsls.length; i++) {
			s += hsls[i][1] * weights[i];
			l += hsls[i][2] * weights[i];
		}
		const [r, g, b] = hslToRgb(h, s / total, l / total);
		return rgbToHex(r, g, b);
	});

	function addStop() {
		stops = [...stops, { color: "#ffffff", weight: 1 }];
	}

	function removeStop(i: number) {
		if (stops.length <= 1) return;
		stops = stops.filter((_, idx) => idx !== i);
	}

	let copied = $state(false);
	async function copy() {
		if (!mixed) return;
		await navigator.clipboard.writeText(mixed);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-3xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Color Mixer</h1>
		<p class="text-muted-foreground mt-1">
			Blend any number of colors with custom weights, in sRGB, linear-light, or HSL space.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="space-y-1.5">
				<Label for="sp">Mix space</Label>
				<Select.Root type="single" bind:value={space as never}>
					<Select.Trigger id="sp" class="w-full">{spaceLabels[space]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="rgb">sRGB linear weighted</Select.Item>
						<Select.Item value="linear">Linear-light RGB (gamma-correct)</Select.Item>
						<Select.Item value="hsl">HSL</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Color stops</Card.Title></Card.Header>
		<Card.Content class="space-y-2">
			{#each stops as stop, i (i)}
				<div class="flex items-center gap-2">
					<Input type="color" bind:value={stops[i].color} class="h-10 w-16 cursor-pointer p-1" />
					<Input bind:value={stops[i].color} class="flex-1 font-mono" />
					<Input type="number" min="0" step="0.1" bind:value={stops[i].weight} class="w-24 font-mono" />
					<Button variant="ghost" size="sm" onclick={() => removeStop(i)} disabled={stops.length <= 1}>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			{/each}
			<Button variant="outline" size="sm" onclick={addStop}>
				<Plus class="h-4 w-4" />
				Add stop
			</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Result</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!mixed}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			{#if mixed}
				<div class="flex items-center gap-4">
					<div class="h-20 w-20 rounded border" style="background:{mixed}"></div>
					<p class="font-mono text-xl">{mixed}</p>
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">Enter at least one valid hex color with a positive weight.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
