<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import {
		parseIsoDuration,
		formatIsoDuration,
		humanReadable,
		totalSeconds,
		ZERO,
		type Duration
	} from "$lib/iso-duration";

	let isoInput = $state("P3Y6M4DT12H30M5S");
	let parsed = $derived.by<{ ok: true; value: Duration } | { ok: false; error: string }>(() => {
		try {
			return { ok: true, value: parseIsoDuration(isoInput) };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	});

	let builder = $state<Duration>({ ...ZERO, hours: 1, minutes: 30 });
	let builderIso = $derived(formatIsoDuration(builder));

	const samples = ["PT30S", "PT15M", "PT1H30M", "P1D", "P1W", "P3Y6M4DT12H30M5S", "-PT5M"];

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
		<h1 class="text-3xl font-bold tracking-tight">ISO 8601 Duration</h1>
		<p class="text-muted-foreground mt-1">
			Parse and build ISO 8601 duration strings (e.g. <code>P1Y2DT3H</code>).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Parse</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<Input bind:value={isoInput} class="font-mono" />
			<div class="flex flex-wrap gap-1">
				{#each samples as s (s)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-0.5 font-mono text-xs"
						onclick={() => (isoInput = s)}
					>
						{s}
					</button>
				{/each}
			</div>
			{#if parsed.ok}
				<div class="bg-muted space-y-2 rounded-md p-3">
					<p class="font-mono text-sm">{humanReadable(parsed.value)}</p>
					<p class="text-muted-foreground text-xs">
						≈ {totalSeconds(parsed.value).toLocaleString()} seconds (uses 1mo = 30.4375d, 1y = 365.25d)
					</p>
				</div>
			{:else}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{parsed.error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Build</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{#each [
					{ k: "years", label: "Years" },
					{ k: "months", label: "Months" },
					{ k: "weeks", label: "Weeks" },
					{ k: "days", label: "Days" },
					{ k: "hours", label: "Hours" },
					{ k: "minutes", label: "Minutes" },
					{ k: "seconds", label: "Seconds" }
				] as field (field.k)}
					<div class="space-y-1.5">
						<Label class="text-xs">{field.label}</Label>
						<Input
							type="number"
							bind:value={builder[field.k as keyof Duration]}
							class="h-8 font-mono text-sm"
						/>
					</div>
				{/each}
			</div>

			<div class="bg-muted flex items-center justify-between rounded-md p-3">
				<div>
					<p class="text-muted-foreground text-xs">ISO 8601</p>
					<p class="font-mono text-lg">{builderIso}</p>
				</div>
				<Button variant="ghost" size="sm" onclick={() => copy("b", builderIso)}>
					{#if copied === "b"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</main>
