<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let size = $state<2 | 3>(3);
	let A = $state<number[][]>([
		[1, 2, 3],
		[0, 1, 4],
		[5, 6, 0]
	]);
	let B = $state<number[][]>([
		[2, 0, 0],
		[0, 1, 0],
		[0, 0, 3]
	]);

	function ensureSize(m: number[][], n: number): number[][] {
		const out: number[][] = [];
		for (let i = 0; i < n; i++) {
			out[i] = [];
			for (let j = 0; j < n; j++) {
				out[i][j] = m[i]?.[j] ?? 0;
			}
		}
		return out;
	}

	$effect(() => {
		A = ensureSize(A, size);
		B = ensureSize(B, size);
	});

	function det2(m: number[][]): number {
		return m[0][0] * m[1][1] - m[0][1] * m[1][0];
	}

	function det3(m: number[][]): number {
		return (
			m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
			m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
			m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
		);
	}

	function det(m: number[][]): number {
		return size === 2 ? det2(m) : det3(m);
	}

	function transpose(m: number[][]): number[][] {
		return m[0].map((_, j) => m.map((row) => row[j]));
	}

	function multiply(a: number[][], b: number[][]): number[][] {
		const n = a.length;
		const out: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let s = 0;
				for (let k = 0; k < n; k++) s += a[i][k] * b[k][j];
				out[i][j] = s;
			}
		}
		return out;
	}

	function add(a: number[][], b: number[][]): number[][] {
		return a.map((row, i) => row.map((v, j) => v + b[i][j]));
	}

	function sub(a: number[][], b: number[][]): number[][] {
		return a.map((row, i) => row.map((v, j) => v - b[i][j]));
	}

	function inverse(m: number[][]): number[][] | null {
		const d = det(m);
		if (d === 0) return null;
		if (size === 2) {
			return [
				[m[1][1] / d, -m[0][1] / d],
				[-m[1][0] / d, m[0][0] / d]
			];
		}
		// 3x3 cofactor / adjoint
		const cofactor: number[][] = [];
		for (let i = 0; i < 3; i++) {
			cofactor[i] = [];
			for (let j = 0; j < 3; j++) {
				const minor = m
					.filter((_, ri) => ri !== i)
					.map((row) => row.filter((_, ci) => ci !== j));
				const sign = (i + j) % 2 === 0 ? 1 : -1;
				cofactor[i][j] = sign * (minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0]);
			}
		}
		const adj = transpose(cofactor);
		return adj.map((row) => row.map((v) => v / d));
	}

	function trace(m: number[][]): number {
		let s = 0;
		for (let i = 0; i < m.length; i++) s += m[i][i];
		return s;
	}

	function fmt(n: number, digits = 4): string {
		if (!Number.isFinite(n)) return "—";
		const s = n.toFixed(digits);
		return s.replace(/\.?0+$/, "");
	}

	function fmtMatrix(m: number[][]): string {
		const widths = m[0].map((_, j) => Math.max(...m.map((row) => fmt(row[j]).length)));
		return m
			.map(
				(row) =>
					"  " + row.map((v, j) => fmt(v).padStart(widths[j], " ")).join("  ")
			)
			.join("\n");
	}

	let detA = $derived(det(A));
	let detB = $derived(det(B));
	let invA = $derived(inverse(A));
	let invB = $derived(inverse(B));
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Matrix Calculator</h1>
		<p class="text-muted-foreground mt-1">
			2×2 and 3×3 matrices: determinant, transpose, inverse, multiplication, and arithmetic.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="flex gap-2">
				<Button variant={size === 2 ? "default" : "outline"} size="sm" onclick={() => (size = 2)}>2×2</Button>
				<Button variant={size === 3 ? "default" : "outline"} size="sm" onclick={() => (size = 3)}>3×3</Button>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<Label class="mb-2 block">Matrix A</Label>
					<div class="grid gap-1" style="grid-template-columns: repeat({size}, 1fr)">
						{#each Array(size) as _, i (i)}
							{#each Array(size) as _, j (j)}
								<Input
									type="number"
									step="any"
									bind:value={A[i][j]}
									class="h-9 font-mono text-sm"
								/>
							{/each}
						{/each}
					</div>
					<p class="text-muted-foreground mt-2 text-xs">det(A) = {fmt(detA)} · trace(A) = {fmt(trace(A))}</p>
				</div>
				<div>
					<Label class="mb-2 block">Matrix B</Label>
					<div class="grid gap-1" style="grid-template-columns: repeat({size}, 1fr)">
						{#each Array(size) as _, i (i)}
							{#each Array(size) as _, j (j)}
								<Input
									type="number"
									step="any"
									bind:value={B[i][j]}
									class="h-9 font-mono text-sm"
								/>
							{/each}
						{/each}
					</div>
					<p class="text-muted-foreground mt-2 text-xs">det(B) = {fmt(detB)} · trace(B) = {fmt(trace(B))}</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-3 md:grid-cols-2">
		{#each [
			{ k: "A + B", v: fmtMatrix(add(A, B)) },
			{ k: "A − B", v: fmtMatrix(sub(A, B)) },
			{ k: "A × B", v: fmtMatrix(multiply(A, B)) },
			{ k: "B × A", v: fmtMatrix(multiply(B, A)) },
			{ k: "Aᵀ (transpose)", v: fmtMatrix(transpose(A)) },
			{ k: "Bᵀ (transpose)", v: fmtMatrix(transpose(B)) },
			{ k: "A⁻¹ (inverse)", v: invA ? fmtMatrix(invA) : "(singular — det = 0)" },
			{ k: "B⁻¹ (inverse)", v: invB ? fmtMatrix(invB) : "(singular — det = 0)" }
		] as item, i (i)}
			<Card.Root>
				<Card.Header class="pb-2"><Card.Title class="text-sm">{item.k}</Card.Title></Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs">{item.v}</pre>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
