<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	type Field = "a" | "b" | "c" | "A" | "B";
	let aIn = $state("3");
	let bIn = $state("4");
	let cIn = $state("");
	let AIn = $state("");
	let BIn = $state("");

	function num(v: string): number | null {
		const t = v.trim();
		if (!t) return null;
		const n = Number(t);
		return Number.isFinite(n) ? n : null;
	}

	let result = $derived.by(() => {
		const a = num(aIn);
		const b = num(bIn);
		const c = num(cIn);
		const A = num(AIn);
		const B = num(BIn);

		const sides = [a, b, c].filter((v): v is number => v !== null && v > 0).length;
		const angles = [A, B].filter((v): v is number => v !== null && v > 0 && v < 90).length;
		const knowns = sides + angles;
		if (knowns < 2) return { ok: false as const, error: "Provide at least 2 values (and not both unknown angles)." };

		let ra = a;
		let rb = b;
		let rc = c;
		let rA = A;
		let rB = B;

		// Two sides known
		if (ra !== null && rb !== null && rc === null) {
			rc = Math.sqrt(ra * ra + rb * rb);
		} else if (ra !== null && rc !== null && rb === null) {
			if (rc <= ra) return { ok: false as const, error: "Hypotenuse must exceed each leg." };
			rb = Math.sqrt(rc * rc - ra * ra);
		} else if (rb !== null && rc !== null && ra === null) {
			if (rc <= rb) return { ok: false as const, error: "Hypotenuse must exceed each leg." };
			ra = Math.sqrt(rc * rc - rb * rb);
		} else if (ra !== null && rA !== null) {
			rA = rA * (Math.PI / 180);
			rB = Math.PI / 2 - rA;
			rb = ra / Math.tan(rA);
			rc = ra / Math.sin(rA);
			rA = (rA * 180) / Math.PI;
			rB = (rB * 180) / Math.PI;
		} else if (rb !== null && rB !== null) {
			rB = rB * (Math.PI / 180);
			rA = Math.PI / 2 - rB;
			ra = rb / Math.tan(rB);
			rc = rb / Math.sin(rB);
			rA = (rA * 180) / Math.PI;
			rB = (rB * 180) / Math.PI;
		} else if (rc !== null && rA !== null) {
			const rad = rA * (Math.PI / 180);
			ra = rc * Math.sin(rad);
			rb = rc * Math.cos(rad);
			rB = 90 - rA;
		} else if (rc !== null && rB !== null) {
			const rad = rB * (Math.PI / 180);
			rb = rc * Math.sin(rad);
			ra = rc * Math.cos(rad);
			rA = 90 - rB;
		} else {
			return { ok: false as const, error: "Could not solve from given combination." };
		}

		if (ra !== null && rb !== null && rA === null) {
			rA = (Math.atan2(ra, rb) * 180) / Math.PI;
			rB = 90 - rA;
		}

		const area = ra && rb ? (ra * rb) / 2 : null;
		const perimeter = ra && rb && rc ? ra + rb + rc : null;

		return {
			ok: true as const,
			a: ra,
			b: rb,
			c: rc,
			A: rA,
			B: rB,
			area,
			perimeter
		};
	});

	function fmt(n: number | null, digits = 6): string {
		if (n === null || !Number.isFinite(n)) return "—";
		return n.toFixed(digits).replace(/\.?0+$/, "");
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
		<h1 class="text-3xl font-bold tracking-tight">Right Triangle Solver</h1>
		<p class="text-muted-foreground mt-1">
			Given any two values (sides or non-right angles), compute the rest. <code>c</code> is the
			hypotenuse; angles in degrees.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Inputs (leave blank for unknowns)</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-3">
			<div class="space-y-1.5"><Label for="a">a (leg opposite A)</Label><Input id="a" bind:value={aIn} class="font-mono" /></div>
			<div class="space-y-1.5"><Label for="b">b (leg opposite B)</Label><Input id="b" bind:value={bIn} class="font-mono" /></div>
			<div class="space-y-1.5"><Label for="c">c (hypotenuse)</Label><Input id="c" bind:value={cIn} class="font-mono" /></div>
			<div class="space-y-1.5"><Label for="A">∠A (deg)</Label><Input id="A" bind:value={AIn} class="font-mono" /></div>
			<div class="space-y-1.5"><Label for="B">∠B (deg)</Label><Input id="B" bind:value={BIn} class="font-mono" /></div>
		</Card.Content>
	</Card.Root>

	{#if result.ok}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Solution</Card.Title></Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">a</dt><dd class="font-mono">{fmt(result.a)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">b</dt><dd class="font-mono">{fmt(result.b)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">c (hyp.)</dt><dd class="font-mono">{fmt(result.c)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">∠A (°)</dt><dd class="font-mono">{fmt(result.A, 4)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">∠B (°)</dt><dd class="font-mono">{fmt(result.B, 4)}</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">∠C (°)</dt><dd class="font-mono">90</dd></div>
					<div class="bg-muted rounded-md p-3"><dt class="text-muted-foreground text-xs">Area</dt><dd class="font-mono">{fmt(result.area)}</dd></div>
					<div class="bg-muted rounded-md p-3 sm:col-span-2"><dt class="text-muted-foreground text-xs">Perimeter</dt><dd class="font-mono">{fmt(result.perimeter)}</dd></div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{result.error}
		</div>
	{/if}
</main>
