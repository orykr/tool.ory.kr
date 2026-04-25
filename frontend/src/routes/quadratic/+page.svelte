<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let aIn = $state(1);
	let bIn = $state(-3);
	let cIn = $state(2);

	let result = $derived.by(() => {
		const a = Number(aIn);
		const b = Number(bIn);
		const c = Number(cIn);
		if (![a, b, c].every(Number.isFinite)) return null;
		if (a === 0) {
			if (b === 0) {
				return c === 0
					? { kind: "infinite" as const }
					: { kind: "none" as const };
			}
			return { kind: "linear" as const, root: -c / b };
		}
		const disc = b * b - 4 * a * c;
		const vertexX = -b / (2 * a);
		const vertexY = a * vertexX * vertexX + b * vertexX + c;
		if (disc > 0) {
			const sqrt = Math.sqrt(disc);
			return {
				kind: "two" as const,
				roots: [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)],
				disc,
				vertex: [vertexX, vertexY] as [number, number]
			};
		}
		if (disc === 0) {
			return {
				kind: "one" as const,
				root: -b / (2 * a),
				disc,
				vertex: [vertexX, vertexY] as [number, number]
			};
		}
		const sqrt = Math.sqrt(-disc);
		return {
			kind: "complex" as const,
			real: -b / (2 * a),
			imag: sqrt / (2 * a),
			disc,
			vertex: [vertexX, vertexY] as [number, number]
		};
	});

	function fmt(n: number, digits = 6): string {
		if (!Number.isFinite(n)) return String(n);
		const fixed = n.toFixed(digits);
		return fixed.replace(/\.?0+$/, "");
	}

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">Quadratic Solver</h1>
		<p class="text-muted-foreground mt-1">
			Solve <code>ax² + bx + c = 0</code>. Reports real or complex roots and the parabola vertex.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Coefficients</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="a">a</Label>
				<Input id="a" type="number" step="any" bind:value={aIn} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="b">b</Label>
				<Input id="b" type="number" step="any" bind:value={bIn} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="c">c</Label>
				<Input id="c" type="number" step="any" bind:value={cIn} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	{#if result}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Solution</Card.Title></Card.Header>
			<Card.Content class="space-y-2 text-sm">
				{#if result.kind === "infinite"}
					<p>Every real number is a solution (0 = 0).</p>
				{:else if result.kind === "none"}
					<p>No solution (constant ≠ 0).</p>
				{:else if result.kind === "linear"}
					<p class="bg-muted rounded p-3 font-mono">x = {fmt(result.root)}</p>
					<p class="text-muted-foreground text-xs">Linear because a = 0.</p>
				{:else}
					<div class="bg-muted rounded p-3">
						<p class="text-muted-foreground text-xs">Discriminant Δ</p>
						<p class="font-mono">{fmt(result.disc)}</p>
					</div>
					{#if result.kind === "two"}
						{@const r0 = result.roots[0]}
						{@const r1 = result.roots[1]}
						<div class="bg-muted flex items-center justify-between rounded p-3">
							<span class="font-mono">x₁ = {fmt(r0)}, x₂ = {fmt(r1)}</span>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => copy("r", `${fmt(r0)}, ${fmt(r1)}`)}
							>
								{#if copied === "r"}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{:else if result.kind === "one"}
						<p class="bg-muted rounded p-3 font-mono">x = {fmt(result.root)} (double root)</p>
					{:else}
						<p class="bg-muted rounded p-3 font-mono">
							x = {fmt(result.real)} ± {fmt(result.imag)}i
						</p>
					{/if}
					<div class="bg-muted rounded p-3">
						<p class="text-muted-foreground text-xs">Vertex (parabola turning point)</p>
						<p class="font-mono">({fmt(result.vertex[0])}, {fmt(result.vertex[1])})</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</main>
