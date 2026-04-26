<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

	function encodeGeohash(lat: number, lon: number, precision: number): string {
		if (lat < -90 || lat > 90) throw new Error("Latitude out of range (-90, 90).");
		if (lon < -180 || lon > 180) throw new Error("Longitude out of range (-180, 180).");
		let latRange = [-90, 90];
		let lonRange = [-180, 180];
		let evenBit = true;
		let bit = 0;
		let ch = 0;
		let out = "";
		while (out.length < precision) {
			if (evenBit) {
				const mid = (lonRange[0] + lonRange[1]) / 2;
				if (lon >= mid) {
					ch = (ch << 1) | 1;
					lonRange = [mid, lonRange[1]];
				} else {
					ch = ch << 1;
					lonRange = [lonRange[0], mid];
				}
			} else {
				const mid = (latRange[0] + latRange[1]) / 2;
				if (lat >= mid) {
					ch = (ch << 1) | 1;
					latRange = [mid, latRange[1]];
				} else {
					ch = ch << 1;
					latRange = [latRange[0], mid];
				}
			}
			evenBit = !evenBit;
			bit++;
			if (bit === 5) {
				out += BASE32[ch];
				bit = 0;
				ch = 0;
			}
		}
		return out;
	}

	function decodeGeohash(hash: string): { lat: number; lon: number; latErr: number; lonErr: number } {
		const lower = hash.toLowerCase();
		let latRange = [-90, 90];
		let lonRange = [-180, 180];
		let evenBit = true;
		for (const c of lower) {
			const idx = BASE32.indexOf(c);
			if (idx < 0) throw new Error(`Invalid geohash character: ${c}`);
			for (let mask = 16; mask >= 1; mask >>= 1) {
				const bit = (idx & mask) !== 0;
				if (evenBit) {
					const mid = (lonRange[0] + lonRange[1]) / 2;
					if (bit) lonRange = [mid, lonRange[1]];
					else lonRange = [lonRange[0], mid];
				} else {
					const mid = (latRange[0] + latRange[1]) / 2;
					if (bit) latRange = [mid, latRange[1]];
					else latRange = [latRange[0], mid];
				}
				evenBit = !evenBit;
			}
		}
		return {
			lat: (latRange[0] + latRange[1]) / 2,
			lon: (lonRange[0] + lonRange[1]) / 2,
			latErr: (latRange[1] - latRange[0]) / 2,
			lonErr: (lonRange[1] - lonRange[0]) / 2
		};
	}

	let latStr = $state("37.5665");
	let lonStr = $state("126.9780");
	let precision = $state(8);

	let encoded = $derived.by(() => {
		try {
			const lat = Number(latStr);
			const lon = Number(lonStr);
			if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Invalid number.");
			const p = Math.max(1, Math.min(12, Math.floor(precision) || 8));
			return { ok: true as const, value: encodeGeohash(lat, lon, p) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let hashInput = $state("wydm9q");
	let decoded = $derived.by(() => {
		try {
			const trimmed = hashInput.trim();
			if (!trimmed) throw new Error("Empty hash.");
			return { ok: true as const, value: decodeGeohash(trimmed) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let copied = $state<string | null>(null);
	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		copied = text;
		setTimeout(() => (copied = null), 1200);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Geohash</h1>
		<p class="text-muted-foreground mt-1">
			Encode latitude/longitude to a geohash and decode it back to a centroid + cell size.
		</p>
	</header>

	<Tabs.Root value="encode">
		<Tabs.List>
			<Tabs.Trigger value="encode">Encode</Tabs.Trigger>
			<Tabs.Trigger value="decode">Decode</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encode">
			<Card.Root class="mb-4">
				<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
					<div class="space-y-1.5">
						<Label for="lat">Latitude</Label>
						<Input id="lat" bind:value={latStr} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="lon">Longitude</Label>
						<Input id="lon" bind:value={lonStr} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="pr">Precision</Label>
						<Input id="pr" type="number" min="1" max="12" bind:value={precision} class="font-mono" />
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Geohash</Card.Title>
					<Button variant="ghost" size="sm" onclick={() => encoded.ok && copy(encoded.value)} disabled={!encoded.ok}>
						{#if encoded.ok && copied === encoded.value}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					{#if encoded.ok}
						<p class="font-mono text-xl">{encoded.value}</p>
					{:else}
						<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
							{encoded.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="decode">
			<Card.Root class="mb-4">
				<Card.Content class="space-y-1.5 pt-6">
					<Label for="hi">Geohash</Label>
					<Input id="hi" bind:value={hashInput} class="font-mono" />
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header><Card.Title class="text-base">Coordinates</Card.Title></Card.Header>
				<Card.Content>
					{#if decoded.ok}
						<dl class="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-sm">
							<dt class="text-muted-foreground">Latitude</dt>
							<dd>{decoded.value.lat.toFixed(7)} ± {decoded.value.latErr.toExponential(2)}°</dd>
							<dt class="text-muted-foreground">Longitude</dt>
							<dd>{decoded.value.lon.toFixed(7)} ± {decoded.value.lonErr.toExponential(2)}°</dd>
						</dl>
					{:else}
						<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
							{decoded.error}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
