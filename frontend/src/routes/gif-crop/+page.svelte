<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import CropOverlay from "$lib/components/crop-overlay.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let file = $state<File | null>(null);
	let inputUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let imgEl = $state<HTMLImageElement | null>(null);
	let natW = $state(0);
	let natH = $state(0);
	let x = $state(0);
	let y = $state(0);
	let w = $state(100);
	let h = $state(100);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Cropping… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setFile(f: File) {
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; inputUrl = URL.createObjectURL(f); outUrl = null;
	}

	function onImgLoad(ev: Event) {
		const t = ev.target as HTMLImageElement;
		natW = t.naturalWidth;
		natH = t.naturalHeight;
		x = 0; y = 0;
		w = Math.min(natW, natH);
		h = w;
	}

	function reset() {
		file = null;
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		inputUrl = null;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = null;
	}

	async function run() {
		if (!file || !loaded) return;
		busy = true; progress = 0; message = "Cropping…";
		try {
			const ff = await getFFmpeg();
			await ff.writeFile("input.gif", await fetchFile(file));
			const sx = Number.isFinite(Number(x)) ? Number(x) : 0;
			const sy = Number.isFinite(Number(y)) ? Number(y) : 0;
			const sw = Number.isFinite(Number(w)) ? Number(w) : natW;
			const sh = Number.isFinite(Number(h)) ? Number(h) : natH;
			const cx = Math.max(0, Math.min(sx, natW - 1));
			const cy = Math.max(0, Math.min(sy, natH - 1));
			const cw = Math.max(1, Math.min(sw, natW - cx));
			const ch = Math.max(1, Math.min(sh, natH - cy));
			const filter = `crop=${cw}:${ch}:${cx}:${cy},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
			await ff.exec(["-i", "input.gif", "-filter_complex", filter, "output.gif"]);
			const data = await ff.readFile("output.gif");
			const buf = (data as Uint8Array).buffer;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "image/gif" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Crop GIF</h1>
		<p class="text-muted-foreground mt-1">Crop an animated GIF to a rectangle. Set the position and size in pixels.</p>
	</header>

	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">
		{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}
	</div>

	{#if !file}
		<FileDrop accept="image/gif" label="Click or drag & drop a GIF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source ({natW}×{natH})</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<CropOverlay bind:natW bind:natH bind:x bind:y bind:w bind:h>
						<img bind:this={imgEl} src={inputUrl} alt="source" class="pointer-events-none block w-full" onload={onImgLoad} draggable="false" />
					</CropOverlay>
					<p class="text-muted-foreground text-xs">Drag the rectangle to move; drag handles to resize; drag empty area to draw a new region.</p>
					<Button variant="outline" class="w-full" onclick={reset}>Change GIF</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Crop region (px)</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5"><Label for="cx">X</Label><Input id="cx" type="number" bind:value={x} min="0" max={natW} /></div>
						<div class="space-y-1.5"><Label for="cy">Y</Label><Input id="cy" type="number" bind:value={y} min="0" max={natH} /></div>
						<div class="space-y-1.5"><Label for="cw">Width</Label><Input id="cw" type="number" bind:value={w} min="1" max={natW} /></div>
						<div class="space-y-1.5"><Label for="ch">Height</Label><Input id="ch" type="number" bind:value={h} min="1" max={natH} /></div>
					</div>
					<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Crop"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="cropped.gif"><Download />Download GIF</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
