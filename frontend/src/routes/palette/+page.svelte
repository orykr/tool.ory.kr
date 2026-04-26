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
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { hslToRgb, rgbToHex, type HSL } from "$lib/color";

	type Mode = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic" | "random";

	const modeLabels: Record<Mode, string> = {
		complementary: "Complementary (2)",
		analogous: "Analogous (5)",
		triadic: "Triadic (3)",
		tetradic: "Tetradic (4)",
		monochromatic: "Monochromatic (5)",
		random: "Random (8)"
	};

	let mode = $state<Mode>("analogous");
	let baseHue = $state([220]);
	let saturation = $state([72]);
	let lightness = $state([55]);
	let randomSeed = $state(0);

	function randomHue(): number {
		const buf = new Uint16Array(1);
		crypto.getRandomValues(buf);
		return buf[0] % 360;
	}

	let palette = $derived.by(() => {
		void randomSeed;
		const h = baseHue[0];
		const s = saturation[0];
		const l = lightness[0];
		const colors: Array<{ h: number; s: number; l: number }> = [];
		switch (mode) {
			case "complementary":
				colors.push({ h, s, l });
				colors.push({ h: (h + 180) % 360, s, l });
				break;
			case "analogous":
				for (let i = -2; i <= 2; i++) colors.push({ h: (h + i * 30 + 360) % 360, s, l });
				break;
			case "triadic":
				colors.push({ h, s, l });
				colors.push({ h: (h + 120) % 360, s, l });
				colors.push({ h: (h + 240) % 360, s, l });
				break;
			case "tetradic":
				colors.push({ h, s, l });
				colors.push({ h: (h + 60) % 360, s, l });
				colors.push({ h: (h + 180) % 360, s, l });
				colors.push({ h: (h + 240) % 360, s, l });
				break;
			case "monochromatic":
				for (let i = 0; i < 5; i++) {
					colors.push({ h, s, l: Math.max(15, Math.min(90, l + (i - 2) * 12)) });
				}
				break;
			case "random":
				for (let i = 0; i < 8; i++) {
					const buf = new Uint16Array(3);
					crypto.getRandomValues(buf);
					colors.push({
						h: buf[0] % 360,
						s: 50 + (buf[1] % 50),
						l: 35 + (buf[2] % 40)
					});
				}
				break;
		}
		return colors.map((c) => {
			const rgb = hslToRgb({ ...c, a: 1 } as HSL);
			return {
				h: c.h,
				s: c.s,
				l: c.l,
				hex: rgbToHex(rgb).toUpperCase(),
				rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
			};
		});
	});

	function isLight(hex: string): boolean {
		const n = parseInt(hex.slice(1), 16);
		const r = (n >> 16) & 0xff;
		const g = (n >> 8) & 0xff;
		const b = n & 0xff;
		return r * 0.299 + g * 0.587 + b * 0.114 > 150;
	}

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1000);
	}

	function reroll() {
		if (mode === "random") {
			randomSeed++;
		} else {
			baseHue = [randomHue()];
		}
	}

	function copyAll() {
		const text = palette.map((c) => c.hex).join("\n");
		copy(text);
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
		<h1 class="text-3xl font-bold tracking-tight">Color Palette Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate harmonic color palettes with HSL color theory.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Settings</Card.Title>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={reroll}>
					<RefreshCw />
					Random
				</Button>
				<Button variant="outline" size="sm" onclick={copyAll}>Copy all</Button>
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-1.5">
				<Label for="mode">Harmony</Label>
				<Select.Root type="single" bind:value={mode as never}>
					<Select.Trigger id="mode" class="w-full">{modeLabels[mode]}</Select.Trigger>
					<Select.Content>
						{#each Object.entries(modeLabels) as [k, v] (k)}
							<Select.Item value={k}>{v}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if mode !== "random"}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Base hue</Label>
						<span class="text-muted-foreground font-mono text-sm">{baseHue[0]}°</span>
					</div>
					<Slider type="multiple" bind:value={baseHue} min={0} max={359} step={1} />
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Saturation</Label>
						<span class="text-muted-foreground font-mono text-sm">{saturation[0]}%</span>
					</div>
					<Slider type="multiple" bind:value={saturation} min={0} max={100} step={1} />
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Lightness</Label>
						<span class="text-muted-foreground font-mono text-sm">{lightness[0]}%</span>
					</div>
					<Slider type="multiple" bind:value={lightness} min={0} max={100} step={1} />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Palette</Card.Title></Card.Header>
		<Card.Content>
			<div class="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
				{#each palette as c, i (i + c.hex)}
					<button
						type="button"
						class="group relative h-32 rounded-md border p-3 text-left text-sm font-medium transition-transform hover:scale-105"
						style="background: {c.hex}; color: {isLight(c.hex) ? '#000' : '#fff'}"
						onclick={() => copy(c.hex)}
					>
						<p class="font-mono">{c.hex}</p>
						<p class="font-mono text-xs opacity-80">{c.rgb}</p>
						<p class="font-mono text-xs opacity-80">
							hsl({c.h.toFixed(0)}, {c.s.toFixed(0)}%, {c.l.toFixed(0)}%)
						</p>
						{#if copied === c.hex}
							<span class="bg-foreground/30 absolute inset-0 flex items-center justify-center rounded-md">
								<Check class="h-6 w-6" />
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</main>
