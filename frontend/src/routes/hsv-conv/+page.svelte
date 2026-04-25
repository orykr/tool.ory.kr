<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type RGB = { r: number; g: number; b: number };
	type HSL = { h: number; s: number; l: number };
	type HSV = { h: number; s: number; v: number };

	let r = $state(120);
	let g = $state(180);
	let b = $state(220);

	function rgbToHex({ r, g, b }: RGB): string {
		const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
		return `#${h(r)}${h(g)}${h(b)}`;
	}

	function hexToRgb(hex: string): RGB | null {
		const m = hex.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
		if (!m) return null;
		let s = m[1];
		if (s.length === 3) s = s.split("").map((c) => c + c).join("");
		return {
			r: parseInt(s.slice(0, 2), 16),
			g: parseInt(s.slice(2, 4), 16),
			b: parseInt(s.slice(4, 6), 16)
		};
	}

	function rgbToHsl({ r, g, b }: RGB): HSL {
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
		return { h, s: s * 100, l: l * 100 };
	}

	function rgbToHsv({ r, g, b }: RGB): HSV {
		const rn = r / 255, gn = g / 255, bn = b / 255;
		const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
		const v = max;
		const d = max - min;
		const s = max === 0 ? 0 : d / max;
		let h = 0;
		if (d !== 0) {
			if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
			else if (max === gn) h = (bn - rn) / d + 2;
			else h = (rn - gn) / d + 4;
			h *= 60;
		}
		return { h, s: s * 100, v: v * 100 };
	}

	function hsvToRgb({ h, s, v }: HSV): RGB {
		const sn = s / 100, vn = v / 100;
		const c = vn * sn;
		const hp = (((h % 360) + 360) % 360) / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r1 = 0, g1 = 0, b1 = 0;
		if (0 <= hp && hp < 1) [r1, g1, b1] = [c, x, 0];
		else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
		else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
		else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
		else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
		else [r1, g1, b1] = [c, 0, x];
		const m = vn - c;
		return {
			r: Math.round((r1 + m) * 255),
			g: Math.round((g1 + m) * 255),
			b: Math.round((b1 + m) * 255)
		};
	}

	function hslToRgb({ h, s, l }: HSL): RGB {
		const sn = s / 100, ln = l / 100;
		const c = (1 - Math.abs(2 * ln - 1)) * sn;
		const hp = (((h % 360) + 360) % 360) / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r1 = 0, g1 = 0, b1 = 0;
		if (0 <= hp && hp < 1) [r1, g1, b1] = [c, x, 0];
		else if (1 <= hp && hp < 2) [r1, g1, b1] = [x, c, 0];
		else if (2 <= hp && hp < 3) [r1, g1, b1] = [0, c, x];
		else if (3 <= hp && hp < 4) [r1, g1, b1] = [0, x, c];
		else if (4 <= hp && hp < 5) [r1, g1, b1] = [x, 0, c];
		else [r1, g1, b1] = [c, 0, x];
		const m = ln - c / 2;
		return {
			r: Math.round((r1 + m) * 255),
			g: Math.round((g1 + m) * 255),
			b: Math.round((b1 + m) * 255)
		};
	}

	let rgb = $derived({ r, g, b });
	let hex = $derived(rgbToHex(rgb));
	let hsl = $derived(rgbToHsl(rgb));
	let hsv = $derived(rgbToHsv(rgb));

	let hexInput = $state(rgbToHex({ r: 120, g: 180, b: 220 }));
	$effect(() => {
		hexInput = rgbToHex(rgb);
	});

	function applyHex() {
		const parsed = hexToRgb(hexInput);
		if (parsed) {
			r = parsed.r;
			g = parsed.g;
			b = parsed.b;
		}
	}

	function applyHsl(newHsl: HSL) {
		const next = hslToRgb(newHsl);
		r = next.r;
		g = next.g;
		b = next.b;
	}

	function applyHsv(newHsv: HSV) {
		const next = hsvToRgb(newHsv);
		r = next.r;
		g = next.g;
		b = next.b;
	}

	let copied = $state<string | null>(null);
	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = text;
		setTimeout(() => (copied = null), 1200);
	}

	function fmtPct(n: number): string {
		return `${n.toFixed(1)}%`;
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
		<h1 class="text-3xl font-bold tracking-tight">HSV / HSL / RGB / HEX</h1>
		<p class="text-muted-foreground mt-1">
			Bidirectional color converter between hex, RGB, HSL and HSV.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-4">
				<div class="h-24 w-24 rounded border" style="background:{hex}"></div>
				<div class="flex-1 space-y-1 font-mono text-sm">
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground w-12">HEX</span>
						<span>{hex}</span>
						<Button variant="ghost" size="sm" class="ml-auto" onclick={() => copy(hex)}>
							{#if copied === hex}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground w-12">RGB</span>
						<span>rgb({r}, {g}, {b})</span>
						<Button variant="ghost" size="sm" class="ml-auto" onclick={() => copy(`rgb(${r}, ${g}, ${b})`)}>
							{#if copied === `rgb(${r}, ${g}, ${b})`}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground w-12">HSL</span>
						<span>hsl({hsl.h.toFixed(1)}, {fmtPct(hsl.s)}, {fmtPct(hsl.l)})</span>
						<Button variant="ghost" size="sm" class="ml-auto" onclick={() => copy(`hsl(${hsl.h.toFixed(1)}, ${fmtPct(hsl.s)}, ${fmtPct(hsl.l)})`)}>
							{#if copied === `hsl(${hsl.h.toFixed(1)}, ${fmtPct(hsl.s)}, ${fmtPct(hsl.l)})`}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground w-12">HSV</span>
						<span>hsv({hsv.h.toFixed(1)}, {fmtPct(hsv.s)}, {fmtPct(hsv.v)})</span>
						<Button variant="ghost" size="sm" class="ml-auto" onclick={() => copy(`hsv(${hsv.h.toFixed(1)}, ${fmtPct(hsv.s)}, ${fmtPct(hsv.v)})`)}>
							{#if copied === `hsv(${hsv.h.toFixed(1)}, ${fmtPct(hsv.s)}, ${fmtPct(hsv.v)})`}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">RGB</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div>
					<Label>R: {r}</Label>
					<Slider type="single" min={0} max={255} step={1} value={r} onValueChange={(v) => (r = v)} />
				</div>
				<div>
					<Label>G: {g}</Label>
					<Slider type="single" min={0} max={255} step={1} value={g} onValueChange={(v) => (g = v)} />
				</div>
				<div>
					<Label>B: {b}</Label>
					<Slider type="single" min={0} max={255} step={1} value={b} onValueChange={(v) => (b = v)} />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">HEX</Card.Title></Card.Header>
			<Card.Content class="space-y-2">
				<Input bind:value={hexInput} class="font-mono" />
				<Button size="sm" onclick={applyHex}>Apply</Button>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">HSL</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div>
					<Label>H: {hsl.h.toFixed(1)}°</Label>
					<Slider type="single" min={0} max={360} step={1} value={Math.round(hsl.h)} onValueChange={(v) => applyHsl({ ...hsl, h: v })} />
				</div>
				<div>
					<Label>S: {fmtPct(hsl.s)}</Label>
					<Slider type="single" min={0} max={100} step={1} value={Math.round(hsl.s)} onValueChange={(v) => applyHsl({ ...hsl, s: v })} />
				</div>
				<div>
					<Label>L: {fmtPct(hsl.l)}</Label>
					<Slider type="single" min={0} max={100} step={1} value={Math.round(hsl.l)} onValueChange={(v) => applyHsl({ ...hsl, l: v })} />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-base">HSV</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div>
					<Label>H: {hsv.h.toFixed(1)}°</Label>
					<Slider type="single" min={0} max={360} step={1} value={Math.round(hsv.h)} onValueChange={(v) => applyHsv({ ...hsv, h: v })} />
				</div>
				<div>
					<Label>S: {fmtPct(hsv.s)}</Label>
					<Slider type="single" min={0} max={100} step={1} value={Math.round(hsv.s)} onValueChange={(v) => applyHsv({ ...hsv, s: v })} />
				</div>
				<div>
					<Label>V: {fmtPct(hsv.v)}</Label>
					<Slider type="single" min={0} max={100} step={1} value={Math.round(hsv.v)} onValueChange={(v) => applyHsv({ ...hsv, v: v })} />
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>
