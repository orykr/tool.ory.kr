<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Play from "@lucide/svelte/icons/play";
	import Pause from "@lucide/svelte/icons/pause";
	import Flag from "@lucide/svelte/icons/flag";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let elapsed = $state(0);
	let running = $state(false);
	let startTime = 0;
	let baseElapsed = 0;
	let raf: number | undefined;
	let laps = $state<Array<{ index: number; total: number; lap: number }>>([]);
	let lastLapTotal = 0;

	function tick() {
		elapsed = baseElapsed + (performance.now() - startTime);
		if (running) raf = requestAnimationFrame(tick);
	}

	function start() {
		if (running) return;
		running = true;
		startTime = performance.now();
		raf = requestAnimationFrame(tick);
	}

	function pause() {
		if (!running) return;
		baseElapsed += performance.now() - startTime;
		running = false;
		if (raf !== undefined) cancelAnimationFrame(raf);
	}

	function reset() {
		pause();
		baseElapsed = 0;
		elapsed = 0;
		laps = [];
		lastLapTotal = 0;
	}

	function lap() {
		if (!running && elapsed === 0) return;
		const lapTime = elapsed - lastLapTotal;
		lastLapTotal = elapsed;
		laps = [{ index: laps.length + 1, total: elapsed, lap: lapTime }, ...laps];
	}

	onDestroy(() => {
		if (raf !== undefined) cancelAnimationFrame(raf);
	});

	function fmt(ms: number): string {
		const totalSec = ms / 1000;
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor((totalSec % 3600) / 60);
		const s = Math.floor(totalSec % 60);
		const cs = Math.floor((ms % 1000) / 10);
		const pad = (n: number) => n.toString().padStart(2, "0");
		if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
		return `${pad(m)}:${pad(s)}.${pad(cs)}`;
	}

	let copied = $state(false);
	async function copyAllLaps() {
		const text = laps
			.slice()
			.reverse()
			.map((l) => `Lap ${l.index}\t${fmt(l.lap)}\ttotal ${fmt(l.total)}`)
			.join("\n");
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	let bestLap = $derived(
		laps.length > 0 ? laps.reduce((b, l) => (l.lap < b.lap ? l : b)) : null
	);
	let worstLap = $derived(
		laps.length > 0 ? laps.reduce((w, l) => (l.lap > w.lap ? l : w)) : null
	);
</script>

<main class="container mx-auto max-w-2xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Stopwatch</h1>
		<p class="text-muted-foreground mt-1">
			Sub-second precision stopwatch with lap tracking and best/worst marks.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-4 pt-6">
			<p class="text-center font-mono text-7xl font-bold tabular-nums">{fmt(elapsed)}</p>

			<div class="flex justify-center gap-2">
				{#if running}
					<Button onclick={pause}>
						<Pause />
						Pause
					</Button>
				{:else}
					<Button onclick={start}>
						<Play />
						{elapsed > 0 ? "Resume" : "Start"}
					</Button>
				{/if}
				<Button variant="outline" onclick={lap} disabled={!running && elapsed === 0}>
					<Flag />
					Lap
				</Button>
				<Button variant="ghost" onclick={reset}>
					<RefreshCw />
					Reset
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	{#if laps.length > 0}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Laps ({laps.length})</Card.Title>
				<Button variant="ghost" size="sm" onclick={copyAllLaps}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="px-2 py-2">#</th>
							<th class="px-2 py-2">Lap time</th>
							<th class="px-2 py-2">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each laps as l (l.index)}
							<tr class="border-b font-mono last:border-0 {bestLap?.index === l.index ? 'bg-emerald-500/10' : worstLap?.index === l.index ? 'bg-rose-500/10' : ''}">
								<td class="px-2 py-1 font-semibold">{l.index}</td>
								<td class="px-2 py-1">{fmt(l.lap)}</td>
								<td class="text-muted-foreground px-2 py-1">{fmt(l.total)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if bestLap && worstLap && laps.length > 1}
					<p class="text-muted-foreground mt-2 text-xs">
						<span class="text-emerald-600 dark:text-emerald-400">Best:</span> {fmt(bestLap.lap)} (#{bestLap.index})
						<span class="text-rose-600 dark:text-rose-400 ml-3">Worst:</span> {fmt(worstLap.lap)} (#{worstLap.index})
					</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</main>
