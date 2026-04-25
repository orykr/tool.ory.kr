<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
	import Clock from "@lucide/svelte/icons/clock";

	function localDateTime(d: Date): string {
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	let startInput = $state(localDateTime(new Date(Date.now() - 86_400_000 * 30)));
	let endInput = $state(localDateTime(new Date()));

	let parsed = $derived.by(() => {
		const s = new Date(startInput);
		const e = new Date(endInput);
		if (Number.isNaN(s.getTime())) return { ok: false as const, error: "Invalid start date." };
		if (Number.isNaN(e.getTime())) return { ok: false as const, error: "Invalid end date." };
		const swapped = e.getTime() < s.getTime();
		const a = swapped ? e : s;
		const b = swapped ? s : e;
		return { ok: true as const, start: a, end: b, swapped };
	});

	let durations = $derived.by(() => {
		if (!parsed.ok) return null;
		const ms = parsed.end.getTime() - parsed.start.getTime();
		const totalSeconds = ms / 1000;
		const totalMinutes = totalSeconds / 60;
		const totalHours = totalMinutes / 60;
		const totalDays = totalHours / 24;
		const totalWeeks = totalDays / 7;

		const yearsCalendar = parsed.end.getFullYear() - parsed.start.getFullYear();
		const monthsCalendar =
			yearsCalendar * 12 + (parsed.end.getMonth() - parsed.start.getMonth());

		// breakdown
		let years = parsed.end.getFullYear() - parsed.start.getFullYear();
		let months = parsed.end.getMonth() - parsed.start.getMonth();
		let days = parsed.end.getDate() - parsed.start.getDate();
		if (days < 0) {
			months--;
			const prevMonth = new Date(parsed.end.getFullYear(), parsed.end.getMonth(), 0);
			days += prevMonth.getDate();
		}
		if (months < 0) {
			years--;
			months += 12;
		}
		const hours = parsed.end.getHours() - parsed.start.getHours();
		const minutes = parsed.end.getMinutes() - parsed.start.getMinutes();

		return {
			ms,
			seconds: totalSeconds,
			minutes: totalMinutes,
			hours: totalHours,
			days: totalDays,
			weeks: totalWeeks,
			months: monthsCalendar,
			years: monthsCalendar / 12,
			breakdown: { years, months, days, hours, minutes }
		};
	});

	function swap() {
		[startInput, endInput] = [endInput, startInput];
	}

	function fmt(n: number, digits = 4): string {
		const fixed = n.toFixed(digits);
		return fixed.replace(/\.?0+$/, "");
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
		<h1 class="text-3xl font-bold tracking-tight">Date Difference</h1>
		<p class="text-muted-foreground mt-1">
			Compute the duration between two timestamps in many units.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header>
			<Card.Title class="text-base">Inputs</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="dd-start">Start</Label>
					<Input id="dd-start" type="datetime-local" bind:value={startInput} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="dd-end">End</Label>
					<Input id="dd-end" type="datetime-local" bind:value={endInput} class="font-mono" />
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowLeftRight />
				Swap
			</Button>

			{#if !parsed.ok}
				<p class="text-destructive text-xs">{parsed.error}</p>
			{:else if parsed.swapped}
				<p class="text-muted-foreground text-xs">
					<Clock class="inline h-3 w-3" /> End is earlier than start; values shown are absolute.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if durations}
		<Card.Root class="mb-4">
			<Card.Header>
				<Card.Title class="text-base">Calendar breakdown</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="bg-muted rounded-md p-3 font-mono text-sm">
					{durations.breakdown.years}y {durations.breakdown.months}mo {durations.breakdown.days}d
					{durations.breakdown.hours}h {durations.breakdown.minutes}m
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Total in each unit</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="divide-y">
					{#each [
						{ k: "Milliseconds", v: durations.ms.toFixed(0) },
						{ k: "Seconds", v: fmt(durations.seconds, 3) },
						{ k: "Minutes", v: fmt(durations.minutes, 4) },
						{ k: "Hours", v: fmt(durations.hours, 4) },
						{ k: "Days", v: fmt(durations.days, 4) },
						{ k: "Weeks", v: fmt(durations.weeks, 4) },
						{ k: "Months (calendar)", v: durations.months.toString() },
						{ k: "Years (calendar)", v: fmt(durations.years, 4) }
					] as item, i (i)}
						<div class="flex items-center justify-between py-2 text-sm">
							<dt class="text-muted-foreground">{item.k}</dt>
							<dd class="font-mono">{item.v}</dd>
						</div>
					{/each}
				</dl>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
