<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import { parseCsv } from "$lib/csv";
	import { computeStats } from "$lib/stats";

	let csv = $state(`id,name,age,salary,country
1,Alice,30,75000.50,KR
2,Bob,25,52000,JP
3,Charlie,40,98000,US
4,Dana,35,88000.25,DE
5,Eve,28,67000,KR
6,Frank,45,110000,US`);

	let parsed = $derived.by(() => {
		try {
			return { ok: true as const, data: parseCsv(csv) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	type ColInfo = {
		name: string;
		count: number;
		nonEmpty: number;
		unique: number;
		minLen: number;
		maxLen: number;
		topValues: Array<[string, number]>;
		isNumeric: boolean;
		stats: ReturnType<typeof computeStats>;
	};

	let columns = $derived.by<ColInfo[]>(() => {
		if (!parsed.ok) return [];
		const { headers, rows } = parsed.data;
		return headers.map((h, idx) => {
			const values = rows.map((r) => r[idx] ?? "");
			const nonEmpty = values.filter((v) => v !== "");
			const unique = new Set(nonEmpty).size;
			const lens = nonEmpty.map((v) => v.length);
			const minLen = lens.length ? Math.min(...lens) : 0;
			const maxLen = lens.length ? Math.max(...lens) : 0;

			const counts = new Map<string, number>();
			for (const v of nonEmpty) counts.set(v, (counts.get(v) ?? 0) + 1);
			const topValues = Array.from(counts.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5);

			const numbers: number[] = [];
			let allNumeric = nonEmpty.length > 0;
			for (const v of nonEmpty) {
				const n = Number(v);
				if (!Number.isFinite(n)) {
					allNumeric = false;
					break;
				}
				numbers.push(n);
			}

			return {
				name: h,
				count: values.length,
				nonEmpty: nonEmpty.length,
				unique,
				minLen,
				maxLen,
				topValues,
				isNumeric: allNumeric,
				stats: allNumeric ? computeStats(numbers) : null
			};
		});
	});

	function fmt(n: number, digits = 4): string {
		if (!Number.isFinite(n)) return "—";
		return n.toFixed(digits).replace(/\.?0+$/, "");
	}
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
		<h1 class="text-3xl font-bold tracking-tight">CSV Column Statistics</h1>
		<p class="text-muted-foreground mt-1">
			Per-column counts, unique values, and numeric statistics.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">CSV input</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={csv} class="min-h-40 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	{#if !parsed.ok}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{parsed.error}
		</div>
	{:else if parsed.data.headers.length === 0}
		<p class="text-muted-foreground text-sm">No headers detected.</p>
	{:else}
		<div class="space-y-3">
			{#each columns as c (c.name)}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">
							{c.name}
							{#if c.isNumeric}
								<span class="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ml-2 rounded px-2 py-0.5 text-xs">numeric</span>
							{/if}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
							<div><dt class="text-muted-foreground text-xs">Count</dt><dd class="font-mono">{c.count}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Non-empty</dt><dd class="font-mono">{c.nonEmpty}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Unique</dt><dd class="font-mono">{c.unique}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Length min/max</dt><dd class="font-mono">{c.minLen} / {c.maxLen}</dd></div>
						</dl>

						{#if c.isNumeric && c.stats}
							<dl class="bg-muted mt-3 grid grid-cols-2 gap-2 rounded-md p-3 text-sm sm:grid-cols-4">
								<div><dt class="text-muted-foreground text-xs">Sum</dt><dd class="font-mono">{fmt(c.stats.sum)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Mean</dt><dd class="font-mono">{fmt(c.stats.mean)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Median</dt><dd class="font-mono">{fmt(c.stats.median)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Std dev</dt><dd class="font-mono">{fmt(c.stats.stdDev)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Min</dt><dd class="font-mono">{fmt(c.stats.min)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Max</dt><dd class="font-mono">{fmt(c.stats.max)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Q1</dt><dd class="font-mono">{fmt(c.stats.q1)}</dd></div>
								<div><dt class="text-muted-foreground text-xs">Q3</dt><dd class="font-mono">{fmt(c.stats.q3)}</dd></div>
							</dl>
						{:else if c.topValues.length}
							<div class="mt-3">
								<p class="text-muted-foreground text-xs">Top values</p>
								<ul class="mt-1 text-sm">
									{#each c.topValues as [v, n] (v)}
										<li class="flex justify-between border-b py-1 last:border-0">
											<span class="font-mono">{v}</span>
											<span class="text-muted-foreground font-mono">{n}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</main>
