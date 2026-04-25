<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { decimalToDms, formatDms, parseDmsString } from "$lib/latlon";

	let lat = $state(37.5665);
	let lon = $state(126.978);

	let latDms = $derived(formatDms(decimalToDms(Number(lat) || 0, "lat")));
	let lonDms = $derived(formatDms(decimalToDms(Number(lon) || 0, "lon")));

	let dmsLatInput = $state(`37° 33' 59.4" N`);
	let dmsLonInput = $state(`126° 58' 40.8" E`);

	let dmsLatResult = $derived.by<{ ok: true; value: number } | { ok: false; error: string }>(() => {
		try {
			return { ok: true, value: parseDmsString(dmsLatInput, "lat") };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	});
	let dmsLonResult = $derived.by<{ ok: true; value: number } | { ok: false; error: string }>(() => {
		try {
			return { ok: true, value: parseDmsString(dmsLonInput, "lon") };
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	});

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
		<h1 class="text-3xl font-bold tracking-tight">Lat/Lon Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert between decimal degrees (DD) and degrees-minutes-seconds (DMS).
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Decimal → DMS</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="dd-lat">Latitude (DD)</Label>
					<Input id="dd-lat" type="number" step="any" bind:value={lat} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="dd-lon">Longitude (DD)</Label>
					<Input id="dd-lon" type="number" step="any" bind:value={lon} class="font-mono" />
				</div>
				<div class="bg-muted space-y-2 rounded-md p-3">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-xs">Latitude</span>
						<Button variant="ghost" size="sm" onclick={() => copy("dl", latDms)}>
							{#if copied === "dl"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<p class="font-mono text-sm">{latDms}</p>
					<div class="flex items-center justify-between pt-2">
						<span class="text-muted-foreground text-xs">Longitude</span>
						<Button variant="ghost" size="sm" onclick={() => copy("ln", lonDms)}>
							{#if copied === "ln"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
					<p class="font-mono text-sm">{lonDms}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">DMS → Decimal</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="dms-lat">Latitude</Label>
					<Input id="dms-lat" bind:value={dmsLatInput} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="dms-lon">Longitude</Label>
					<Input id="dms-lon" bind:value={dmsLonInput} class="font-mono" />
				</div>
				<div class="bg-muted space-y-2 rounded-md p-3">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-xs">Latitude (DD)</span>
						{#if dmsLatResult.ok}
							<Button variant="ghost" size="sm" onclick={() => copy("ddl", dmsLatResult.value.toFixed(6))}>
								{#if copied === "ddl"}<Check />{:else}<Copy />{/if}
							</Button>
						{/if}
					</div>
					{#if dmsLatResult.ok}
						<p class="font-mono text-sm">{dmsLatResult.value.toFixed(6)}</p>
					{:else}
						<p class="text-destructive text-xs">{dmsLatResult.error}</p>
					{/if}
					<div class="flex items-center justify-between pt-2">
						<span class="text-muted-foreground text-xs">Longitude (DD)</span>
						{#if dmsLonResult.ok}
							<Button variant="ghost" size="sm" onclick={() => copy("ddln", dmsLonResult.value.toFixed(6))}>
								{#if copied === "ddln"}<Check />{:else}<Copy />{/if}
							</Button>
						{/if}
					</div>
					{#if dmsLonResult.ok}
						<p class="font-mono text-sm">{dmsLonResult.value.toFixed(6)}</p>
					{:else}
						<p class="text-destructive text-xs">{dmsLonResult.error}</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>
