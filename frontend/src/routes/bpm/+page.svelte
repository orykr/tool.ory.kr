<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { onMount, onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	let bpm = $state(120);

	let taps = $state<number[]>([]);
	let tappedBpm = $state<number | null>(null);

	function tap() {
		const now = performance.now();
		taps = [...taps, now].filter((t) => now - t < 5000);
		if (taps.length >= 2) {
			const intervals: number[] = [];
			for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
			const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
			tappedBpm = 60000 / avg;
			bpm = Math.round(tappedBpm);
		}
	}

	function reset() {
		taps = [];
		tappedBpm = null;
	}

	let beatsPerSec = $derived(Number(bpm) / 60);
	let msPerBeat = $derived(60000 / Number(bpm));

	const noteValues: Array<{ name: string; mult: number }> = [
		{ name: "Whole (4 beats)", mult: 4 },
		{ name: "Half (2 beats)", mult: 2 },
		{ name: "Quarter (1 beat)", mult: 1 },
		{ name: "Eighth (1/2)", mult: 0.5 },
		{ name: "Sixteenth (1/4)", mult: 0.25 },
		{ name: "32nd (1/8)", mult: 0.125 },
		{ name: "Triplet quarter (2/3)", mult: 2 / 3 },
		{ name: "Triplet eighth (1/3)", mult: 1 / 3 },
		{ name: "Dotted quarter (1.5)", mult: 1.5 },
		{ name: "Dotted eighth (0.75)", mult: 0.75 }
	];

	let notes = $derived(
		noteValues.map((v) => ({
			name: v.name,
			ms: msPerBeat * v.mult,
			hz: 1000 / (msPerBeat * v.mult)
		}))
	);

	let beatPhase = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;
	let isPlaying = $state(false);

	onMount(() => {
		timer = setInterval(() => (beatPhase = (performance.now() / msPerBeat) % 1), 30);
	});
	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	function playBeat() {
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.connect(g);
			g.connect(ctx.destination);
			o.type = "square";
			o.frequency.value = 1000;
			g.gain.setValueAtTime(0.001, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.005);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
			o.start();
			o.stop(ctx.currentTime + 0.06);
		} catch {}
	}

	let metroTimer: ReturnType<typeof setInterval> | undefined;
	function toggleMetronome() {
		if (isPlaying) {
			isPlaying = false;
			if (metroTimer) clearInterval(metroTimer);
			metroTimer = undefined;
			return;
		}
		isPlaying = true;
		playBeat();
		metroTimer = setInterval(playBeat, msPerBeat);
	}

	$effect(() => {
		void msPerBeat;
		if (isPlaying) {
			if (metroTimer) clearInterval(metroTimer);
			metroTimer = setInterval(playBeat, msPerBeat);
		}
	});

	onDestroy(() => {
		if (metroTimer) clearInterval(metroTimer);
	});

	function fmt(n: number, digits = 3): string {
		if (!Number.isFinite(n)) return "—";
		return n.toFixed(digits).replace(/\.?0+$/, "");
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
		<h1 class="text-3xl font-bold tracking-tight">BPM / Tempo Tools</h1>
		<p class="text-muted-foreground mt-1">
			Tap to find BPM, compute delay times for note values, and toggle a metronome.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">BPM</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex items-end gap-2">
				<div class="flex-1 space-y-1.5">
					<Label for="bpm">Beats per minute</Label>
					<Input id="bpm" type="number" min="20" max="400" step="any" bind:value={bpm} class="font-mono text-lg" />
				</div>
				<Button onclick={toggleMetronome}>
					{isPlaying ? "Stop" : "Metronome"}
				</Button>
			</div>

			<div class="bg-muted relative h-2 overflow-hidden rounded">
				<div class="bg-primary absolute inset-y-0" style="left: 0; width: {beatPhase * 100}%; transition: width 30ms linear"></div>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<Button variant="outline" onclick={tap}>Tap</Button>
				<Button variant="ghost" size="sm" onclick={reset}>
					<RefreshCw />
					Reset taps
				</Button>
				{#if tappedBpm !== null}
					<span class="text-muted-foreground text-sm">
						Tapped: <span class="font-mono">{tappedBpm.toFixed(2)}</span> BPM ({taps.length} taps)
					</span>
				{/if}
			</div>

			<dl class="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
				<div><dt>Beats per second:</dt><dd class="font-mono">{fmt(beatsPerSec)}</dd></div>
				<div><dt>Beat duration:</dt><dd class="font-mono">{fmt(msPerBeat, 2)} ms</dd></div>
			</dl>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Note delays</Card.Title></Card.Header>
		<Card.Content>
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Note</th>
						<th class="px-2 py-2">Delay (ms)</th>
						<th class="px-2 py-2">Frequency (Hz)</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each notes as n, i (n.name)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1">{n.name}</td>
							<td class="px-2 py-1 font-mono">{fmt(n.ms, 3)}</td>
							<td class="px-2 py-1 font-mono">{fmt(n.hz, 3)}</td>
							<td class="px-2 py-1 text-right">
								<Button variant="ghost" size="sm" onclick={() => copy(`m${i}`, fmt(n.ms, 3))}>
									{#if copied === `m${i}`}<Check />{:else}<Copy />{/if}
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</main>
