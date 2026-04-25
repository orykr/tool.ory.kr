<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	function fmt(n: number, digits = 6): string {
		if (!Number.isFinite(n)) return "—";
		const s = n.toFixed(digits);
		return s.replace(/\.?0+$/, "");
	}

	let circleR = $state(5);
	let circle = $derived.by(() => {
		const r = Number(circleR);
		if (!Number.isFinite(r) || r <= 0) return null;
		return {
			diameter: 2 * r,
			circumference: 2 * Math.PI * r,
			area: Math.PI * r * r,
			arcLength: 2 * Math.PI * r
		};
	});

	let rectW = $state(8);
	let rectH = $state(5);
	let rect = $derived.by(() => {
		const w = Number(rectW);
		const h = Number(rectH);
		if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
		return {
			perimeter: 2 * (w + h),
			area: w * h,
			diagonal: Math.sqrt(w * w + h * h)
		};
	});

	let triA = $state(3);
	let triB = $state(4);
	let triC = $state(5);
	let tri = $derived.by(() => {
		const a = Number(triA);
		const b = Number(triB);
		const c = Number(triC);
		if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return null;
		if (a <= 0 || b <= 0 || c <= 0) return null;
		if (a + b <= c || a + c <= b || b + c <= a) return null;
		const s = (a + b + c) / 2;
		const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
		const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c));
		const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c));
		const angleC = Math.PI - angleA - angleB;
		return {
			perimeter: a + b + c,
			area,
			angles: [
				(angleA * 180) / Math.PI,
				(angleB * 180) / Math.PI,
				(angleC * 180) / Math.PI
			],
			inradius: area / s,
			circumradius: (a * b * c) / (4 * area)
		};
	});

	let sphereR = $state(3);
	let sphere = $derived.by(() => {
		const r = Number(sphereR);
		if (!Number.isFinite(r) || r <= 0) return null;
		return {
			surface: 4 * Math.PI * r * r,
			volume: (4 / 3) * Math.PI * r * r * r
		};
	});

	let cylR = $state(2);
	let cylH = $state(5);
	let cyl = $derived.by(() => {
		const r = Number(cylR);
		const h = Number(cylH);
		if (!Number.isFinite(r) || !Number.isFinite(h) || r <= 0 || h <= 0) return null;
		return {
			lateral: 2 * Math.PI * r * h,
			surface: 2 * Math.PI * r * (r + h),
			volume: Math.PI * r * r * h
		};
	});
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
		<h1 class="text-3xl font-bold tracking-tight">Geometry Calculator</h1>
		<p class="text-muted-foreground mt-1">
			Areas, perimeters, and volumes for circles, rectangles, triangles, spheres, and cylinders.
		</p>
	</header>

	<Tabs.Root value="circle">
		<Tabs.List class="grid w-full grid-cols-5">
			<Tabs.Trigger value="circle">Circle</Tabs.Trigger>
			<Tabs.Trigger value="rect">Rectangle</Tabs.Trigger>
			<Tabs.Trigger value="tri">Triangle</Tabs.Trigger>
			<Tabs.Trigger value="sphere">Sphere</Tabs.Trigger>
			<Tabs.Trigger value="cyl">Cylinder</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="circle">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="space-y-1.5">
						<Label for="cr">Radius</Label>
						<Input id="cr" type="number" step="any" bind:value={circleR} class="font-mono" />
					</div>
					{#if circle}
						<dl class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
							<div><dt class="text-muted-foreground text-xs">Diameter</dt><dd class="font-mono">{fmt(circle.diameter)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Circumference</dt><dd class="font-mono">{fmt(circle.circumference)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Area</dt><dd class="font-mono">{fmt(circle.area)}</dd></div>
						</dl>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="rect">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="rw">Width</Label>
							<Input id="rw" type="number" step="any" bind:value={rectW} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="rh">Height</Label>
							<Input id="rh" type="number" step="any" bind:value={rectH} class="font-mono" />
						</div>
					</div>
					{#if rect}
						<dl class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
							<div><dt class="text-muted-foreground text-xs">Perimeter</dt><dd class="font-mono">{fmt(rect.perimeter)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Area</dt><dd class="font-mono">{fmt(rect.area)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Diagonal</dt><dd class="font-mono">{fmt(rect.diagonal)}</dd></div>
						</dl>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="tri">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-3">
						<div class="space-y-1.5">
							<Label for="ta">Side a</Label>
							<Input id="ta" type="number" step="any" bind:value={triA} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="tb">Side b</Label>
							<Input id="tb" type="number" step="any" bind:value={triB} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="tc">Side c</Label>
							<Input id="tc" type="number" step="any" bind:value={triC} class="font-mono" />
						</div>
					</div>
					{#if tri}
						<dl class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
							<div><dt class="text-muted-foreground text-xs">Perimeter</dt><dd class="font-mono">{fmt(tri.perimeter)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Area (Heron)</dt><dd class="font-mono">{fmt(tri.area)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Angle A (°)</dt><dd class="font-mono">{fmt(tri.angles[0], 2)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Angle B (°)</dt><dd class="font-mono">{fmt(tri.angles[1], 2)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Angle C (°)</dt><dd class="font-mono">{fmt(tri.angles[2], 2)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Inradius</dt><dd class="font-mono">{fmt(tri.inradius)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Circumradius</dt><dd class="font-mono">{fmt(tri.circumradius)}</dd></div>
						</dl>
					{:else}
						<p class="text-muted-foreground text-xs">
							Enter three positive sides that satisfy the triangle inequality.
						</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="sphere">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="space-y-1.5">
						<Label for="sr">Radius</Label>
						<Input id="sr" type="number" step="any" bind:value={sphereR} class="font-mono" />
					</div>
					{#if sphere}
						<dl class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
							<div><dt class="text-muted-foreground text-xs">Surface area</dt><dd class="font-mono">{fmt(sphere.surface)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Volume</dt><dd class="font-mono">{fmt(sphere.volume)}</dd></div>
						</dl>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="cyl">
			<Card.Root>
				<Card.Content class="space-y-3 pt-6">
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="space-y-1.5">
							<Label for="cyr">Radius</Label>
							<Input id="cyr" type="number" step="any" bind:value={cylR} class="font-mono" />
						</div>
						<div class="space-y-1.5">
							<Label for="cyh">Height</Label>
							<Input id="cyh" type="number" step="any" bind:value={cylH} class="font-mono" />
						</div>
					</div>
					{#if cyl}
						<dl class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
							<div><dt class="text-muted-foreground text-xs">Lateral surface</dt><dd class="font-mono">{fmt(cyl.lateral)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Total surface</dt><dd class="font-mono">{fmt(cyl.surface)}</dd></div>
							<div><dt class="text-muted-foreground text-xs">Volume</dt><dd class="font-mono">{fmt(cyl.volume)}</dd></div>
						</dl>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
