<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	let a4 = $state(440);
	let mode = $state<"note" | "freq" | "midi">("note");
	let noteName = $state("A");
	let octave = $state(4);
	let freqInput = $state(440);
	let midiInput = $state(69);

	function noteToFreq(note: string, oct: number): number {
		const idx = NOTES.indexOf(note);
		if (idx < 0) return NaN;
		const midi = (oct + 1) * 12 + idx;
		return midiToFreq(midi);
	}

	function midiToFreq(midi: number): number {
		return a4 * Math.pow(2, (midi - 69) / 12);
	}

	function freqToMidi(f: number): number {
		return 69 + 12 * Math.log2(f / a4);
	}

	function midiToNote(midi: number): { note: string; octave: number; cents: number } {
		const m = Math.round(midi);
		const note = NOTES[((m % 12) + 12) % 12];
		const oct = Math.floor(m / 12) - 1;
		const cents = (midi - m) * 100;
		return { note, octave: oct, cents };
	}

	let result = $derived.by(() => {
		if (mode === "note") {
			const idx = NOTES.indexOf(noteName);
			if (idx < 0) return null;
			const midi = (octave + 1) * 12 + idx;
			const freq = noteToFreq(noteName, octave);
			return { note: noteName, octave, midi, freq, cents: 0 };
		}
		if (mode === "freq") {
			if (!Number.isFinite(freqInput) || freqInput <= 0) return null;
			const midi = freqToMidi(freqInput);
			const desc = midiToNote(midi);
			return { note: desc.note, octave: desc.octave, midi: Math.round(midi), freq: freqInput, cents: desc.cents };
		}
		const m = Math.max(0, Math.min(127, Math.round(midiInput)));
		const desc = midiToNote(m);
		return { note: desc.note, octave: desc.octave, midi: m, freq: midiToFreq(m), cents: 0 };
	});

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function play() {
		if (!result) return;
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.connect(g);
			g.connect(ctx.destination);
			o.type = "sine";
			o.frequency.value = result.freq;
			g.gain.setValueAtTime(0.001, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
			o.start();
			o.stop(ctx.currentTime + 0.6);
		} catch {}
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
		<h1 class="text-3xl font-bold tracking-tight">Musical Note ↔ Frequency</h1>
		<p class="text-muted-foreground mt-1">
			Convert between note names, MIDI numbers, and Hz. Equal-temperament tuning.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Tuning</Card.Title></Card.Header>
		<Card.Content>
			<div class="space-y-1.5">
				<Label for="a4">A4 reference (Hz)</Label>
				<Input id="a4" type="number" min="100" max="500" step="any" bind:value={a4} class="w-32 font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="flex gap-2">
				<Button variant={mode === "note" ? "default" : "outline"} size="sm" onclick={() => (mode = "note")}>Note</Button>
				<Button variant={mode === "freq" ? "default" : "outline"} size="sm" onclick={() => (mode = "freq")}>Frequency</Button>
				<Button variant={mode === "midi" ? "default" : "outline"} size="sm" onclick={() => (mode = "midi")}>MIDI</Button>
			</div>
			{#if mode === "note"}
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="nn">Note</Label>
						<Select.Root type="single" bind:value={noteName}>
							<Select.Trigger id="nn" class="w-full">{noteName}</Select.Trigger>
							<Select.Content>
								{#each NOTES as n (n)}
									<Select.Item value={n}>{n}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-1.5">
						<Label for="oc">Octave</Label>
						<Input id="oc" type="number" min="-1" max="9" bind:value={octave} class="font-mono" />
					</div>
				</div>
			{:else if mode === "freq"}
				<div class="space-y-1.5">
					<Label for="fr">Frequency (Hz)</Label>
					<Input id="fr" type="number" min="0.01" step="any" bind:value={freqInput} class="font-mono" />
				</div>
			{:else}
				<div class="space-y-1.5">
					<Label for="mi">MIDI number (0-127)</Label>
					<Input id="mi" type="number" min="0" max="127" bind:value={midiInput} class="font-mono" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if result}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Result</Card.Title>
				<Button variant="outline" size="sm" onclick={play}>Play</Button>
			</Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-2 gap-3 text-sm">
					<div class="bg-muted rounded-md p-3">
						<dt class="text-muted-foreground text-xs">Note</dt>
						<dd class="font-mono text-lg">{result.note}{result.octave}</dd>
					</div>
					<div class="bg-muted rounded-md p-3">
						<dt class="text-muted-foreground text-xs">MIDI</dt>
						<dd class="font-mono text-lg">{result.midi}</dd>
					</div>
					<div class="bg-muted rounded-md p-3">
						<dt class="text-muted-foreground text-xs">Frequency</dt>
						<dd class="font-mono text-lg">{result.freq.toFixed(3)} Hz</dd>
					</div>
					{#if Math.abs(result.cents) > 0.01}
						<div class="bg-muted rounded-md p-3">
							<dt class="text-muted-foreground text-xs">Cents off</dt>
							<dd class="font-mono">{result.cents > 0 ? "+" : ""}{result.cents.toFixed(2)}</dd>
						</div>
					{/if}
				</dl>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
