<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Color = {
		name: string;
		digit: number | null;
		multiplier: number;
		tolerance: number | null;
		hex: string;
		text: string;
	};

	const COLORS: Color[] = [
		{ name: "Black", digit: 0, multiplier: 1, tolerance: null, hex: "#000000", text: "#fff" },
		{ name: "Brown", digit: 1, multiplier: 10, tolerance: 1, hex: "#8B4513", text: "#fff" },
		{ name: "Red", digit: 2, multiplier: 100, tolerance: 2, hex: "#dc2626", text: "#fff" },
		{ name: "Orange", digit: 3, multiplier: 1_000, tolerance: null, hex: "#f97316", text: "#000" },
		{ name: "Yellow", digit: 4, multiplier: 10_000, tolerance: null, hex: "#fde047", text: "#000" },
		{ name: "Green", digit: 5, multiplier: 100_000, tolerance: 0.5, hex: "#16a34a", text: "#fff" },
		{ name: "Blue", digit: 6, multiplier: 1_000_000, tolerance: 0.25, hex: "#2563eb", text: "#fff" },
		{ name: "Violet", digit: 7, multiplier: 10_000_000, tolerance: 0.1, hex: "#7c3aed", text: "#fff" },
		{ name: "Grey", digit: 8, multiplier: 100_000_000, tolerance: 0.05, hex: "#64748b", text: "#fff" },
		{ name: "White", digit: 9, multiplier: 1_000_000_000, tolerance: null, hex: "#ffffff", text: "#000" },
		{ name: "Gold", digit: null, multiplier: 0.1, tolerance: 5, hex: "#ca8a04", text: "#fff" },
		{ name: "Silver", digit: null, multiplier: 0.01, tolerance: 10, hex: "#94a3b8", text: "#000" }
	];

	let bandCount = $state<3 | 4 | 5 | 6>(4);
	let band1 = $state("Brown");
	let band2 = $state("Black");
	let band3 = $state("Black");
	let band4 = $state("Red");
	let band5 = $state("Gold");
	let band6 = $state("Brown");

	function color(name: string): Color {
		return COLORS.find((c) => c.name === name) ?? COLORS[0];
	}

	let result = $derived.by(() => {
		const c1 = color(band1);
		const c2 = color(band2);
		const c3 = color(band3);
		const c4 = color(band4);
		const c5 = color(band5);
		const c6 = color(band6);

		let digits: number;
		let multiplier: number;
		let tolerance: number | null;
		let tempCoeff: number | null = null;

		if (bandCount === 3) {
			if (c1.digit === null || c2.digit === null) return null;
			digits = c1.digit * 10 + c2.digit;
			multiplier = c3.multiplier;
			tolerance = 20;
		} else if (bandCount === 4) {
			if (c1.digit === null || c2.digit === null) return null;
			digits = c1.digit * 10 + c2.digit;
			multiplier = c3.multiplier;
			tolerance = c4.tolerance;
		} else if (bandCount === 5) {
			if (c1.digit === null || c2.digit === null || c3.digit === null) return null;
			digits = c1.digit * 100 + c2.digit * 10 + c3.digit;
			multiplier = c4.multiplier;
			tolerance = c5.tolerance;
		} else {
			if (c1.digit === null || c2.digit === null || c3.digit === null) return null;
			digits = c1.digit * 100 + c2.digit * 10 + c3.digit;
			multiplier = c4.multiplier;
			tolerance = c5.tolerance;
			tempCoeff = c6.tolerance;
		}

		const ohms = digits * multiplier;
		return { ohms, tolerance, tempCoeff };
	});

	function format(ohms: number): string {
		if (ohms >= 1_000_000_000) return `${(ohms / 1_000_000_000).toFixed(2)} GΩ`;
		if (ohms >= 1_000_000) return `${(ohms / 1_000_000).toFixed(2)} MΩ`;
		if (ohms >= 1_000) return `${(ohms / 1_000).toFixed(2)} kΩ`;
		return `${ohms.toFixed(2)} Ω`;
	}

	let copied = $state(false);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

	const bandCounts: (3 | 4 | 5 | 6)[] = [3, 4, 5, 6];

	const bandList = [
		{ idx: 1, label: "Band 1 (digit)" },
		{ idx: 2, label: "Band 2 (digit)" },
		{ idx: 3, label: "Band 3" },
		{ idx: 4, label: "Band 4" },
		{ idx: 5, label: "Band 5" },
		{ idx: 6, label: "Band 6" }
	];

	function bandLabel(i: number): string {
		if (bandCount === 3) return ["1st digit", "2nd digit", "Multiplier"][i - 1] ?? "";
		if (bandCount === 4) return ["1st digit", "2nd digit", "Multiplier", "Tolerance"][i - 1] ?? "";
		if (bandCount === 5) return ["1st digit", "2nd digit", "3rd digit", "Multiplier", "Tolerance"][i - 1] ?? "";
		return ["1st digit", "2nd digit", "3rd digit", "Multiplier", "Tolerance", "Temp coeff"][i - 1] ?? "";
	}

	function bandValue(i: number): string {
		return [band1, band2, band3, band4, band5, band6][i - 1];
	}

	function setBand(i: number, value: string) {
		if (i === 1) band1 = value;
		else if (i === 2) band2 = value;
		else if (i === 3) band3 = value;
		else if (i === 4) band4 = value;
		else if (i === 5) band5 = value;
		else band6 = value;
	}

	function digitColors(): Color[] {
		return COLORS.filter((c) => c.digit !== null);
	}

	function multiplierColors(): Color[] {
		return COLORS;
	}

	function toleranceColors(): Color[] {
		return COLORS.filter((c) => c.tolerance !== null);
	}

	function colorsForBand(i: number): Color[] {
		const lastDigitBand = bandCount === 5 || bandCount === 6 ? 3 : 2;
		const multBand = lastDigitBand + 1;
		const tolBand = multBand + 1;
		if (i <= lastDigitBand) return digitColors();
		if (i === multBand) return multiplierColors();
		if (i === tolBand && bandCount > 3) return toleranceColors();
		if (i === 6) return toleranceColors();
		return COLORS;
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
		<h1 class="text-3xl font-bold tracking-tight">Resistor Color Decoder</h1>
		<p class="text-muted-foreground mt-1">
			Decode 3-, 4-, 5-, and 6-band axial resistor color codes.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Bands</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex gap-2">
				{#each bandCounts as n (n)}
					<Button
						variant={bandCount === n ? "default" : "outline"}
						size="sm"
						onclick={() => (bandCount = n)}
					>
						{n} bands
					</Button>
				{/each}
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				{#each bandList.slice(0, bandCount) as band, i (band.idx)}
					<div class="space-y-1.5">
						<Label>{bandLabel(band.idx)}</Label>
						<Select.Root type="single" bind:value={() => bandValue(band.idx), (v) => setBand(band.idx, v)}>
							<Select.Trigger class="w-full">
								<span class="inline-block h-3 w-3 rounded mr-2" style="background: {color(bandValue(band.idx)).hex}"></span>
								{bandValue(band.idx)}
							</Select.Trigger>
							<Select.Content>
								{#each colorsForBand(band.idx) as c (c.name)}
									<Select.Item value={c.name}>{c.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex h-16 items-center justify-center gap-1 rounded-md border bg-amber-50 px-4 dark:bg-amber-950/20">
				<div class="bg-foreground/40 h-1 flex-1"></div>
				{#each bandList.slice(0, bandCount) as band (band.idx)}
					{@const c = color(bandValue(band.idx))}
					<div
						class="h-12 w-4 rounded border border-black/20"
						style="background: {c.hex}"
						title={c.name}
					></div>
				{/each}
				<div class="bg-foreground/40 h-1 flex-1"></div>
			</div>
		</Card.Content>
	</Card.Root>

	{#if result}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Value</Card.Title></Card.Header>
			<Card.Content class="space-y-2">
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<p class="font-mono text-2xl font-bold">{format(result.ohms)}</p>
					<Button variant="ghost" size="sm" onclick={() => copy(`${result.ohms} Ω`)}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				<p class="text-muted-foreground text-sm">
					Tolerance: ±{result.tolerance ?? "?"}%{#if result.tempCoeff !== null && result.tempCoeff !== undefined} · Temp coefficient: {result.tempCoeff} ppm/K{/if}
				</p>
				<p class="text-muted-foreground text-xs">Raw: {result.ohms.toLocaleString()} Ω</p>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
