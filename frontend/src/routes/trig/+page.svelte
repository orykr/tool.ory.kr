<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let value = $state(45);
	let unit = $state<"deg" | "rad">("deg");

	function toRad(v: number): number {
		return unit === "deg" ? (v * Math.PI) / 180 : v;
	}

	function toDeg(v: number): number {
		return unit === "deg" ? v : (v * 180) / Math.PI;
	}

	let r = $derived.by(() => {
		const v = Number(value);
		if (!Number.isFinite(v)) return null;
		const radians = toRad(v);
		const degrees = unit === "deg" ? v : (v * 180) / Math.PI;
		return {
			radians,
			degrees,
			sin: Math.sin(radians),
			cos: Math.cos(radians),
			tan: Math.tan(radians),
			csc: 1 / Math.sin(radians),
			sec: 1 / Math.cos(radians),
			cot: 1 / Math.tan(radians),
			sinh: Math.sinh(radians),
			cosh: Math.cosh(radians),
			tanh: Math.tanh(radians)
		};
	});

	let inverseValue = $state(0.5);
	let inverseUnit = $state<"deg" | "rad">("deg");

	let inv = $derived.by(() => {
		const v = Number(inverseValue);
		if (!Number.isFinite(v)) return null;
		function out(rad: number): number {
			return inverseUnit === "deg" ? (rad * 180) / Math.PI : rad;
		}
		return {
			asin: v >= -1 && v <= 1 ? out(Math.asin(v)) : NaN,
			acos: v >= -1 && v <= 1 ? out(Math.acos(v)) : NaN,
			atan: out(Math.atan(v))
		};
	});

	function fmt(n: number, digits = 8): string {
		if (!Number.isFinite(n)) return "—";
		const s = n.toFixed(digits);
		return s.replace(/\.?0+$/, "");
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
		<h1 class="text-3xl font-bold tracking-tight">Trigonometry Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Compute sin/cos/tan and inverse trig functions in degrees or radians.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Forward (angle → ratios)</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex items-end gap-3">
				<div class="flex-1 space-y-1.5">
					<Label for="v">Angle</Label>
					<Input id="v" type="number" step="any" bind:value={value} class="font-mono" />
				</div>
				<div class="flex gap-2">
					<Button variant={unit === "deg" ? "default" : "outline"} size="sm" onclick={() => (unit = "deg")}>deg</Button>
					<Button variant={unit === "rad" ? "default" : "outline"} size="sm" onclick={() => (unit = "rad")}>rad</Button>
				</div>
			</div>
			{#if r}
				<dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">Radians</dt><dd class="font-mono">{fmt(r.radians)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">Degrees</dt><dd class="font-mono">{fmt(r.degrees)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">sin</dt><dd class="font-mono">{fmt(r.sin)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">cos</dt><dd class="font-mono">{fmt(r.cos)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">tan</dt><dd class="font-mono">{fmt(r.tan)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">csc (1/sin)</dt><dd class="font-mono">{fmt(r.csc)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">sec (1/cos)</dt><dd class="font-mono">{fmt(r.sec)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">cot (1/tan)</dt><dd class="font-mono">{fmt(r.cot)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">sinh</dt><dd class="font-mono">{fmt(r.sinh)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">cosh</dt><dd class="font-mono">{fmt(r.cosh)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">tanh</dt><dd class="font-mono">{fmt(r.tanh)}</dd></div>
				</dl>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Inverse (ratio → angle)</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex items-end gap-3">
				<div class="flex-1 space-y-1.5">
					<Label for="iv">Ratio</Label>
					<Input id="iv" type="number" step="any" bind:value={inverseValue} class="font-mono" />
				</div>
				<div class="flex gap-2">
					<Button variant={inverseUnit === "deg" ? "default" : "outline"} size="sm" onclick={() => (inverseUnit = "deg")}>deg</Button>
					<Button variant={inverseUnit === "rad" ? "default" : "outline"} size="sm" onclick={() => (inverseUnit = "rad")}>rad</Button>
				</div>
			</div>
			{#if inv}
				<dl class="grid grid-cols-3 gap-3 text-sm">
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">asin</dt><dd class="font-mono">{fmt(inv.asin)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">acos</dt><dd class="font-mono">{fmt(inv.acos)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">atan</dt><dd class="font-mono">{fmt(inv.atan)}</dd></div>
				</dl>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
