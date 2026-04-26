<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let baseFile = $state<File | null>(null);
	let baseUrl = $state<string | null>(null);
	let overlayFile = $state<File | null>(null);
	let overlayUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);

	let posX = $state(10);
	let posY = $state(10);
	let opacity = $state([1]);
	let scalePct = $state(100);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Compositing… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	async function run() {
		if (!baseFile || !overlayFile || !loaded) return;
		busy = true; progress = 0; message = "Compositing…";
		try {
			const ff = await getFFmpeg();
			const baseExt = baseFile.name.split(".").pop()?.toLowerCase() || "gif";
			const ovExt = overlayFile.name.split(".").pop()?.toLowerCase() || "png";
			await ff.writeFile(`base.${baseExt}`, await fetchFile(baseFile));
			await ff.writeFile(`ov.${ovExt}`, await fetchFile(overlayFile));
			const a = Math.max(0, Math.min(1, opacity[0]));
			const sf = Math.max(1, Math.min(500, scalePct)) / 100;
			const filter = `[1:v]scale=iw*${sf}:ih*${sf},format=rgba,colorchannelmixer=aa=${a}[ov];[0:v][ov]overlay=${posX}:${posY},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
			await ff.exec(["-i", `base.${baseExt}`, "-i", `ov.${ovExt}`, "-filter_complex", filter, "output.gif"]);
			const data = await ff.readFile("output.gif");
			const buf = (data as Uint8Array).buffer;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "image/gif" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}

	function setBase(f: File) {
		if (baseUrl) URL.revokeObjectURL(baseUrl);
		baseFile = f; baseUrl = URL.createObjectURL(f);
	}
	function setOv(f: File) {
		if (overlayUrl) URL.revokeObjectURL(overlayUrl);
		overlayFile = f; overlayUrl = URL.createObjectURL(f);
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Overlay Image on GIF</h1>
		<p class="text-muted-foreground mt-1">Composite a static image (PNG/JPEG/WebP) on top of an animated GIF.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Base GIF</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if baseUrl}
					<img src={baseUrl} alt="base" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { baseFile = null; if (baseUrl) URL.revokeObjectURL(baseUrl); baseUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="image/gif" label="Drop the base GIF" onfiles={(f) => setBase(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Overlay Image</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if overlayUrl}
					<img src={overlayUrl} alt="overlay" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { overlayFile = null; if (overlayUrl) URL.revokeObjectURL(overlayUrl); overlayUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="image/png,image/jpeg,image/webp,image/gif" label="Drop the overlay" onfiles={(f) => setOv(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if baseFile && overlayFile}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Position & Style</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="px">X (px)</Label><Input id="px" type="number" bind:value={posX} /></div>
					<div class="space-y-1.5"><Label for="py">Y (px)</Label><Input id="py" type="number" bind:value={posY} /></div>
					<div class="space-y-1.5"><Label for="sc">Overlay scale (%)</Label><Input id="sc" type="number" bind:value={scalePct} min="1" max="500" /></div>
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between"><Label>Opacity</Label><span class="text-muted-foreground text-sm">{(opacity[0] * 100).toFixed(0)}%</span></div>
					<Slider type="single" bind:value={opacity} min={0} max={1} step={0.05} />
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Composite"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="overlay.gif"><Download />Download GIF</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
