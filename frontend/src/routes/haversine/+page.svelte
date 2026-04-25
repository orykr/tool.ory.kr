<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let lat1 = $state(37.5665);
	let lon1 = $state(126.978);
	let lat2 = $state(35.6895);
	let lon2 = $state(139.6917);

	const EARTH_KM = 6371.0088;

	function toRad(deg: number): number {
		return (deg * Math.PI) / 180;
	}

	let result = $derived.by(() => {
		const φ1 = toRad(lat1);
		const φ2 = toRad(lat2);
		const Δφ = toRad(lat2 - lat1);
		const Δλ = toRad(lon2 - lon1);

		const a =
			Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const km = EARTH_KM * c;

		const y = Math.sin(Δλ) * Math.cos(φ2);
		const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
		const θ = Math.atan2(y, x);
		const bearing = ((θ * 180) / Math.PI + 360) % 360;

		return { km, miles: km * 0.621371, meters: km * 1000, bearing };
	});

	function compass(deg: number): string {
		const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
		return dirs[Math.round(deg / 22.5) % 16];
	}

	const presets = [
		{ name: "Seoul → Tokyo", a: [37.5665, 126.978], b: [35.6895, 139.6917] },
		{ name: "NY → London", a: [40.7128, -74.006], b: [51.5074, -0.1278] },
		{ name: "Sydney → LA", a: [-33.8688, 151.2093], b: [34.0522, -118.2437] },
		{ name: "Cairo → Mumbai", a: [30.0444, 31.2357], b: [19.076, 72.8777] }
	];
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
		<h1 class="text-3xl font-bold tracking-tight">Haversine Distance</h1>
		<p class="text-muted-foreground mt-1">
			Great-circle distance and initial bearing between two points on Earth.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="la1">Lat 1 (°)</Label>
				<Input id="la1" type="number" step="any" bind:value={lat1} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="lo1">Lon 1 (°)</Label>
				<Input id="lo1" type="number" step="any" bind:value={lon1} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="la2">Lat 2 (°)</Label>
				<Input id="la2" type="number" step="any" bind:value={lat2} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="lo2">Lon 2 (°)</Label>
				<Input id="lo2" type="number" step="any" bind:value={lon2} class="font-mono" />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="flex flex-wrap gap-1 pt-6">
			{#each presets as p (p.name)}
				<button
					type="button"
					class="bg-background hover:bg-muted rounded border px-2 py-0.5 text-xs"
					onclick={() => {
						[lat1, lon1] = p.a as [number, number];
						[lat2, lon2] = p.b as [number, number];
					}}
				>
					{p.name}
				</button>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
		<Card.Content>
			<dl class="grid grid-cols-2 gap-3">
				<div class="bg-muted rounded-md p-3">
					<dt class="text-muted-foreground text-xs">Kilometers</dt>
					<dd class="font-mono text-lg">{result.km.toFixed(2)} km</dd>
				</div>
				<div class="bg-muted rounded-md p-3">
					<dt class="text-muted-foreground text-xs">Miles</dt>
					<dd class="font-mono text-lg">{result.miles.toFixed(2)} mi</dd>
				</div>
				<div class="bg-muted rounded-md p-3">
					<dt class="text-muted-foreground text-xs">Meters</dt>
					<dd class="font-mono text-lg">{result.meters.toFixed(0)} m</dd>
				</div>
				<div class="bg-muted rounded-md p-3">
					<dt class="text-muted-foreground text-xs">Initial bearing</dt>
					<dd class="font-mono text-lg">{result.bearing.toFixed(2)}° {compass(result.bearing)}</dd>
				</div>
			</dl>
			<p class="text-muted-foreground mt-2 text-xs">
				Using mean Earth radius {EARTH_KM} km. The Haversine formula assumes a spherical Earth.
			</p>
		</Card.Content>
	</Card.Root>
</main>
