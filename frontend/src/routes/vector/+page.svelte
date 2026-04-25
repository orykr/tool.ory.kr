<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let mode = $state<"2d" | "3d">("3d");
	let aX = $state(1);
	let aY = $state(2);
	let aZ = $state(3);
	let bX = $state(4);
	let bY = $state(5);
	let bZ = $state(6);

	let A = $derived(mode === "3d" ? [Number(aX), Number(aY), Number(aZ)] : [Number(aX), Number(aY)]);
	let B = $derived(mode === "3d" ? [Number(bX), Number(bY), Number(bZ)] : [Number(bX), Number(bY)]);

	function dot(a: number[], b: number[]): number {
		let s = 0;
		for (let i = 0; i < a.length; i++) s += a[i] * b[i];
		return s;
	}

	function magnitude(a: number[]): number {
		return Math.sqrt(dot(a, a));
	}

	function cross3(a: number[], b: number[]): number[] {
		return [
			a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0]
		];
	}

	function cross2(a: number[], b: number[]): number {
		return a[0] * b[1] - a[1] * b[0];
	}

	function add(a: number[], b: number[]): number[] {
		return a.map((v, i) => v + b[i]);
	}

	function sub(a: number[], b: number[]): number[] {
		return a.map((v, i) => v - b[i]);
	}

	function scale(a: number[], s: number): number[] {
		return a.map((v) => v * s);
	}

	function normalize(a: number[]): number[] {
		const m = magnitude(a);
		return m === 0 ? a.map(() => 0) : a.map((v) => v / m);
	}

	function fmt(n: number, digits = 6): string {
		if (!Number.isFinite(n)) return "—";
		const s = n.toFixed(digits);
		return s.replace(/\.?0+$/, "");
	}

	function fmtVec(v: number[]): string {
		return `(${v.map((x) => fmt(x)).join(", ")})`;
	}

	let result = $derived.by(() => {
		const ma = magnitude(A);
		const mb = magnitude(B);
		const dotProd = dot(A, B);
		const cosTheta = ma === 0 || mb === 0 ? 0 : dotProd / (ma * mb);
		const angle = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
		return {
			a: A,
			b: B,
			ma,
			mb,
			dot: dotProd,
			angleRad: angle,
			angleDeg: (angle * 180) / Math.PI,
			sum: add(A, B),
			diff: sub(A, B),
			scaledA: scale(A, 2),
			scaledB: scale(B, 2),
			normA: normalize(A),
			normB: normalize(B),
			cross: mode === "3d" ? cross3(A, B) : null,
			cross2d: mode === "2d" ? cross2(A, B) : null,
			projection:
				dot(B, B) === 0
					? null
					: scale(B, dot(A, B) / dot(B, B))
		};
	});
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
		<h1 class="text-3xl font-bold tracking-tight">Vector Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Add, subtract, dot, cross, normalize, and project 2D / 3D vectors.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="flex gap-2">
				<Button variant={mode === "2d" ? "default" : "outline"} size="sm" onclick={() => (mode = "2d")}>2D</Button>
				<Button variant={mode === "3d" ? "default" : "outline"} size="sm" onclick={() => (mode = "3d")}>3D</Button>
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-2">
					<Label>Vector A</Label>
					<div class="grid gap-2 {mode === '3d' ? 'grid-cols-3' : 'grid-cols-2'}">
						<Input type="number" step="any" bind:value={aX} class="font-mono" />
						<Input type="number" step="any" bind:value={aY} class="font-mono" />
						{#if mode === "3d"}
							<Input type="number" step="any" bind:value={aZ} class="font-mono" />
						{/if}
					</div>
				</div>
				<div class="space-y-2">
					<Label>Vector B</Label>
					<div class="grid gap-2 {mode === '3d' ? 'grid-cols-3' : 'grid-cols-2'}">
						<Input type="number" step="any" bind:value={bX} class="font-mono" />
						<Input type="number" step="any" bind:value={bY} class="font-mono" />
						{#if mode === "3d"}
							<Input type="number" step="any" bind:value={bZ} class="font-mono" />
						{/if}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Results</Card.Title></Card.Header>
		<Card.Content>
			<dl class="space-y-2 text-sm">
				{#each [
					{ k: "|A|", v: fmt(result.ma) },
					{ k: "|B|", v: fmt(result.mb) },
					{ k: "A · B (dot)", v: fmt(result.dot) },
					{ k: "Angle (deg)", v: fmt(result.angleDeg, 4) },
					{ k: "Angle (rad)", v: fmt(result.angleRad, 6) },
					{ k: "A + B", v: fmtVec(result.sum) },
					{ k: "A − B", v: fmtVec(result.diff) },
					{ k: "2 A", v: fmtVec(result.scaledA) },
					{ k: "2 B", v: fmtVec(result.scaledB) },
					{ k: "Â (normalized)", v: fmtVec(result.normA) },
					{ k: "B̂ (normalized)", v: fmtVec(result.normB) },
					{ k: "proj_B(A)", v: result.projection ? fmtVec(result.projection) : "(B is zero)" }
				] as item, i (i)}
					<div class="bg-muted flex justify-between rounded-md p-3">
						<dt class="text-muted-foreground">{item.k}</dt>
						<dd class="font-mono">{item.v}</dd>
					</div>
				{/each}
				{#if result.cross}
					<div class="bg-muted flex justify-between rounded-md p-3">
						<dt class="text-muted-foreground">A × B (cross)</dt>
						<dd class="font-mono">{fmtVec(result.cross)}</dd>
					</div>
				{:else if result.cross2d !== null}
					<div class="bg-muted flex justify-between rounded-md p-3">
						<dt class="text-muted-foreground">A × B (2D z-comp)</dt>
						<dd class="font-mono">{fmt(result.cross2d)}</dd>
					</div>
				{/if}
			</dl>
		</Card.Content>
	</Card.Root>
</main>
