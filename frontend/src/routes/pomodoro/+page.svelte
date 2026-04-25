<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Play from "@lucide/svelte/icons/play";
	import Pause from "@lucide/svelte/icons/pause";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	type Phase = "focus" | "short" | "long";

	let focusMin = $state(25);
	let shortMin = $state(5);
	let longMin = $state(15);
	let cyclesPerLong = $state(4);

	let phase = $state<Phase>("focus");
	let secondsLeft = $state(25 * 60);
	let running = $state(false);
	let completedFocus = $state(0);

	let total = $derived(
		phase === "focus" ? focusMin * 60 : phase === "short" ? shortMin * 60 : longMin * 60
	);
	let progress = $derived(total > 0 ? Math.max(0, Math.min(100, ((total - secondsLeft) / total) * 100)) : 0);

	let timerId: ReturnType<typeof setInterval> | undefined;
	let lastTick = 0;

	function start() {
		if (running) return;
		running = true;
		lastTick = Date.now();
		timerId = setInterval(tick, 250);
	}

	function pause() {
		running = false;
		if (timerId) clearInterval(timerId);
		timerId = undefined;
	}

	function reset() {
		pause();
		secondsLeft = total;
	}

	function tick() {
		const now = Date.now();
		const elapsed = (now - lastTick) / 1000;
		lastTick = now;
		secondsLeft = Math.max(0, secondsLeft - elapsed);
		if (secondsLeft <= 0) {
			advance();
		}
	}

	function advance() {
		pause();
		ding();
		if (phase === "focus") {
			completedFocus++;
			phase = completedFocus % cyclesPerLong === 0 ? "long" : "short";
		} else {
			phase = "focus";
		}
		secondsLeft = total;
	}

	function ding() {
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.connect(g);
			g.connect(ctx.destination);
			o.frequency.value = 880;
			g.gain.setValueAtTime(0.001, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
			o.start();
			o.stop(ctx.currentTime + 0.6);
		} catch {}
	}

	$effect(() => {
		if (!running) {
			secondsLeft = total;
		}
	});

	onDestroy(() => {
		if (timerId) clearInterval(timerId);
	});

	function format(s: number): string {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
	}

	function setPhase(p: Phase) {
		pause();
		phase = p;
	}

	const phaseLabels: Record<Phase, string> = {
		focus: "Focus",
		short: "Short break",
		long: "Long break"
	};

	const phaseColors: Record<Phase, string> = {
		focus: "text-rose-500",
		short: "text-emerald-500",
		long: "text-sky-500"
	};
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
		<h1 class="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
		<p class="text-muted-foreground mt-1">
			Focus and break intervals with audible chime when each phase ends.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-4 pt-6">
			<div class="flex flex-wrap gap-2">
				{#each (["focus", "short", "long"] as Phase[]) as p (p)}
					<Button
						variant={phase === p ? "default" : "outline"}
						size="sm"
						onclick={() => setPhase(p)}
					>
						{phaseLabels[p]}
					</Button>
				{/each}
			</div>

			<div class="text-center">
				<p class="font-mono text-7xl font-bold {phaseColors[phase]}">{format(secondsLeft)}</p>
				<p class="text-muted-foreground mt-1 text-sm">{phaseLabels[phase]}</p>
			</div>

			<Progress value={progress} max={100} />

			<div class="flex justify-center gap-2">
				{#if running}
					<Button onclick={pause}>
						<Pause />
						Pause
					</Button>
				{:else}
					<Button onclick={start}>
						<Play />
						Start
					</Button>
				{/if}
				<Button variant="outline" onclick={reset}>
					<RefreshCw />
					Reset
				</Button>
			</div>

			<p class="text-muted-foreground text-center text-xs">
				Completed focus sessions: {completedFocus}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
		<Card.Content>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div class="space-y-1.5">
					<Label class="text-xs">Focus (min)</Label>
					<Input type="number" min="1" max="120" bind:value={focusMin} class="h-8 font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs">Short break</Label>
					<Input type="number" min="1" max="60" bind:value={shortMin} class="h-8 font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs">Long break</Label>
					<Input type="number" min="1" max="120" bind:value={longMin} class="h-8 font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs">Cycles / long</Label>
					<Input type="number" min="1" max="20" bind:value={cyclesPerLong} class="h-8 font-mono" />
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</main>
