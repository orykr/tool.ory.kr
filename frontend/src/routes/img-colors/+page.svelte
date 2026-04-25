<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let imageUrl = $state<string | null>(null);
	let count = $state(8);
	let palette = $state<Array<{ hex: string; rgb: [number, number, number]; ratio: number }>>([]);
	let busy = $state(false);
	let errorMsg = $state<string | null>(null);
	let buckets = $state<Map<string, number> | null>(null);
	let totalOpaque = $state(0);

	function rgbToHex(r: number, g: number, b: number): string {
		const h = (n: number) => n.toString(16).padStart(2, "0");
		return `#${h(r)}${h(g)}${h(b)}`;
	}

	function buildBuckets(data: Uint8ClampedArray): { buckets: Map<string, number>; total: number } {
		const buckets = new Map<string, number>();
		let total = 0;
		for (let i = 0; i < data.length; i += 4) {
			const a = data[i + 3];
			if (a < 128) continue;
			total++;
			const r = data[i] >> 4;
			const g = data[i + 1] >> 4;
			const b = data[i + 2] >> 4;
			const key = `${r},${g},${b}`;
			buckets.set(key, (buckets.get(key) ?? 0) + 1);
		}
		return { buckets, total };
	}

	function rebuildPalette() {
		if (!buckets || totalOpaque === 0) {
			palette = [];
			return;
		}
		const k = Math.max(1, Math.min(32, Math.floor(count) || 8));
		const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
		const result: Array<{ hex: string; rgb: [number, number, number]; ratio: number }> = [];
		for (const [key, n] of sorted) {
			const [r4, g4, b4] = key.split(",").map(Number);
			const r = (r4 << 4) | r4;
			const g = (g4 << 4) | g4;
			const b = (b4 << 4) | b4;
			result.push({ hex: rgbToHex(r, g, b), rgb: [r, g, b], ratio: n / totalOpaque });
		}
		palette = result;
	}

	$effect(() => {
		void count;
		rebuildPalette();
	});

	async function loadFile(file: File) {
		busy = true;
		errorMsg = null;
		try {
			if (imageUrl) URL.revokeObjectURL(imageUrl);
			const url = URL.createObjectURL(file);
			imageUrl = url;
			const img = new Image();
			img.crossOrigin = "anonymous";
			await new Promise<void>((res, rej) => {
				img.onload = () => res();
				img.onerror = () => rej(new Error("Failed to load image."));
				img.src = url;
			});

			const maxDim = 200;
			const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Canvas 2D context unavailable.");
			ctx.drawImage(img, 0, 0, w, h);
			const { data } = ctx.getImageData(0, 0, w, h);

			const built = buildBuckets(data);
			buckets = built.buckets;
			totalOpaque = built.total;
			rebuildPalette();
		} catch (e) {
			errorMsg = (e as Error).message;
			palette = [];
			buckets = null;
			totalOpaque = 0;
		} finally {
			busy = false;
		}
	}

	function onPick(ev: Event) {
		const target = ev.currentTarget as HTMLInputElement;
		const f = target.files?.[0];
		if (f) loadFile(f);
	}

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
		<h1 class="text-3xl font-bold tracking-tight">Image Color Palette</h1>
		<p class="text-muted-foreground mt-1">
			Pick the dominant colors from a local image. Pixels are quantized to 4 bits per channel.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="img">Image file</Label>
					<Input id="img" type="file" accept="image/*" onchange={onPick} />
				</div>
				<div class="space-y-1.5">
					<Label for="count">Colors</Label>
					<Input id="count" type="number" min="1" max="32" bind:value={count} />
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	{#if errorMsg}
		<div class="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-sm">
			{errorMsg}
		</div>
	{/if}

	{#if imageUrl}
		<Card.Root class="mb-4">
			<Card.Header><Card.Title class="text-base">Preview</Card.Title></Card.Header>
			<Card.Content>
				<img src={imageUrl} alt="Selected" class="max-h-64 rounded border" />
			</Card.Content>
		</Card.Root>
	{/if}

	{#if palette.length}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Palette</Card.Title></Card.Header>
			<Card.Content>
				<div class="space-y-2">
					{#each palette as p (p.hex)}
						<div class="flex items-center gap-3">
							<div class="h-10 w-10 rounded border" style="background:{p.hex}"></div>
							<div class="flex-1 font-mono text-sm">
								<div>{p.hex} <span class="text-muted-foreground">rgb({p.rgb.join(", ")})</span></div>
								<div class="text-muted-foreground text-xs">{(p.ratio * 100).toFixed(1)}%</div>
							</div>
							<Button variant="ghost" size="sm" onclick={() => copy(p.hex)}>
								{#if copied === p.hex}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{:else if busy}
		<p class="text-muted-foreground text-sm">Analyzing…</p>
	{/if}
</main>
