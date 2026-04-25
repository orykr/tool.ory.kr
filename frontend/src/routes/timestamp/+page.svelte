<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { onMount, onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Clock from "@lucide/svelte/icons/clock";

	let now = $state(Date.now());
	let interval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		interval = setInterval(() => (now = Date.now()), 1000);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let secondsInput = $state("");
	let millisInput = $state("");
	let isoInput = $state("");

	type Parsed = { date: Date | null; error: string | null };

	function parseSeconds(v: string): Parsed {
		const t = v.trim();
		if (!t) return { date: null, error: null };
		const n = Number(t);
		if (!Number.isFinite(n)) return { date: null, error: "Not a number." };
		const d = new Date(n * 1000);
		if (Number.isNaN(d.getTime())) return { date: null, error: "Out of range." };
		return { date: d, error: null };
	}

	function parseMillis(v: string): Parsed {
		const t = v.trim();
		if (!t) return { date: null, error: null };
		const n = Number(t);
		if (!Number.isFinite(n)) return { date: null, error: "Not a number." };
		const d = new Date(n);
		if (Number.isNaN(d.getTime())) return { date: null, error: "Out of range." };
		return { date: d, error: null };
	}

	function parseIso(v: string): Parsed {
		const t = v.trim();
		if (!t) return { date: null, error: null };
		const d = new Date(t);
		if (Number.isNaN(d.getTime())) return { date: null, error: "Invalid date." };
		return { date: d, error: null };
	}

	let secondsParsed = $derived(parseSeconds(secondsInput));
	let millisParsed = $derived(parseMillis(millisInput));
	let isoParsed = $derived(parseIso(isoInput));

	let copied = $state<string | null>(null);
	async function copyValue(label: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = label;
		setTimeout(() => (copied = null), 1200);
	}

	function useNow(target: "seconds" | "millis" | "iso") {
		const d = new Date();
		if (target === "seconds") secondsInput = String(Math.floor(d.getTime() / 1000));
		else if (target === "millis") millisInput = String(d.getTime());
		else isoInput = d.toISOString();
	}

	function describe(d: Date | null) {
		if (!d) return null;
		return {
			iso: d.toISOString(),
			utc: d.toUTCString(),
			local: d.toString(),
			seconds: Math.floor(d.getTime() / 1000),
			millis: d.getTime()
		};
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
		<h1 class="text-3xl font-bold tracking-tight">Unix Timestamp Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between Unix epoch (seconds and milliseconds) and human-readable dates.
		</p>
	</header>

	<Card.Root class="mb-6">
		<Card.Content class="flex items-center justify-between gap-4 pt-6">
			<div class="flex items-center gap-3">
				<Clock class="text-primary h-5 w-5" />
				<div>
					<p class="text-muted-foreground text-xs">Now</p>
					<p class="font-mono text-sm">{Math.floor(now / 1000)} (s) · {now} (ms)</p>
					<p class="text-muted-foreground font-mono text-xs">{new Date(now).toISOString()}</p>
				</div>
			</div>
			<div class="flex flex-col gap-1">
				<Button
					variant="outline"
					size="sm"
					onclick={() => copyValue("now-s", String(Math.floor(now / 1000)))}
				>
					{#if copied === "now-s"}<Check />Copied{:else}<Copy />Copy s{/if}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => copyValue("now-ms", String(now))}
				>
					{#if copied === "now-ms"}<Check />Copied{:else}<Copy />Copy ms{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="space-y-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Seconds (Unix epoch)</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => useNow("seconds")}>Use now</Button>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="ts-seconds">Seconds</Label>
					<Input id="ts-seconds" bind:value={secondsInput} placeholder="1700000000" class="font-mono" />
				</div>
				{#if secondsParsed.error}<p class="text-destructive text-xs">{secondsParsed.error}</p>{/if}
				{#if secondsParsed.date}
					{@const info = describe(secondsParsed.date)!}
					<dl class="bg-muted space-y-1 rounded-md p-3 text-xs">
						<div class="flex justify-between gap-3"><dt>ISO 8601</dt><dd class="font-mono">{info.iso}</dd></div>
						<div class="flex justify-between gap-3"><dt>UTC</dt><dd class="font-mono">{info.utc}</dd></div>
						<div class="flex justify-between gap-3"><dt>Local</dt><dd class="font-mono">{info.local}</dd></div>
						<div class="flex justify-between gap-3"><dt>Millis</dt><dd class="font-mono">{info.millis}</dd></div>
					</dl>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Milliseconds (Unix epoch)</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => useNow("millis")}>Use now</Button>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="ts-millis">Milliseconds</Label>
					<Input id="ts-millis" bind:value={millisInput} placeholder="1700000000000" class="font-mono" />
				</div>
				{#if millisParsed.error}<p class="text-destructive text-xs">{millisParsed.error}</p>{/if}
				{#if millisParsed.date}
					{@const info = describe(millisParsed.date)!}
					<dl class="bg-muted space-y-1 rounded-md p-3 text-xs">
						<div class="flex justify-between gap-3"><dt>ISO 8601</dt><dd class="font-mono">{info.iso}</dd></div>
						<div class="flex justify-between gap-3"><dt>UTC</dt><dd class="font-mono">{info.utc}</dd></div>
						<div class="flex justify-between gap-3"><dt>Local</dt><dd class="font-mono">{info.local}</dd></div>
						<div class="flex justify-between gap-3"><dt>Seconds</dt><dd class="font-mono">{info.seconds}</dd></div>
					</dl>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Date string</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => useNow("iso")}>Use now</Button>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="ts-iso">ISO / RFC date</Label>
					<Input
						id="ts-iso"
						bind:value={isoInput}
						placeholder="2026-04-26T00:00:00Z"
						class="font-mono"
					/>
				</div>
				{#if isoParsed.error}<p class="text-destructive text-xs">{isoParsed.error}</p>{/if}
				{#if isoParsed.date}
					{@const info = describe(isoParsed.date)!}
					<dl class="bg-muted space-y-1 rounded-md p-3 text-xs">
						<div class="flex justify-between gap-3"><dt>ISO 8601</dt><dd class="font-mono">{info.iso}</dd></div>
						<div class="flex justify-between gap-3"><dt>UTC</dt><dd class="font-mono">{info.utc}</dd></div>
						<div class="flex justify-between gap-3"><dt>Seconds</dt><dd class="font-mono">{info.seconds}</dd></div>
						<div class="flex justify-between gap-3"><dt>Millis</dt><dd class="font-mono">{info.millis}</dd></div>
					</dl>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
