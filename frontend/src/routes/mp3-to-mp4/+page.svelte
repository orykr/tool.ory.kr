<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let audioFile = $state<File | null>(null);
	let audioUrl = $state<string | null>(null);
	let imageFile = $state<File | null>(null);
	let imageUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let outW = $state(1280);
	let outH = $state(720);
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Encoding… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setAudio(f: File) { if (audioUrl) URL.revokeObjectURL(audioUrl); audioFile = f; audioUrl = URL.createObjectURL(f); }
	function setImage(f: File) { if (imageUrl) URL.revokeObjectURL(imageUrl); imageFile = f; imageUrl = URL.createObjectURL(f); }

	async function imgToPng(f: File): Promise<Uint8Array> {
		const u = URL.createObjectURL(f);
		try {
			const img = await new Promise<HTMLImageElement>((r, j) => {
				const i = new Image(); i.onload = () => r(i); i.onerror = () => j(new Error("load")); i.src = u;
			});
			const w = Math.max(2, outW & ~1), h = Math.max(2, outH & ~1);
			const cnv = document.createElement("canvas");
			cnv.width = w; cnv.height = h;
			const ctx = cnv.getContext("2d");
			if (!ctx) throw new Error("no ctx");
			ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
			const ar = img.naturalWidth / img.naturalHeight;
			const ta = w / h;
			let dw, dh;
			if (ar > ta) { dw = w; dh = Math.round(w / ar); } else { dh = h; dw = Math.round(h * ar); }
			ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
			const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/png"));
			if (!blob) throw new Error("blob");
			return new Uint8Array(await blob.arrayBuffer());
		} finally { URL.revokeObjectURL(u); }
	}

	async function run() {
		if (!audioFile || !imageFile || !loaded) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Preparing…";
		try {
			const ff = await getFFmpeg();
			const aext = audioFile.name.split(".").pop()?.toLowerCase() || "mp3";
			await ff.writeFile(`a.${aext}`, await fetchFile(audioFile));
			const png = await imgToPng(imageFile);
			await ff.writeFile("img.png", png);
			message = "Encoding…";
			await ff.exec([
				"-loop", "1",
				"-i", "img.png",
				"-i", `a.${aext}`,
				"-c:v", "libx264", "-tune", "stillimage", "-preset", "medium", "-crf", "23",
				"-c:a", "aac", "-b:a", "192k",
				"-pix_fmt", "yuv420p",
				"-shortest",
				"output.mp4"
			]);
			if (seq !== runSeq) return;
			const data = await ff.readFile("output.mp4") as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "video/mp4" }));
			message = "Done.";
		} catch (e) {
			console.error(e);
			if (seq === runSeq) message = "Failed.";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Audio + Image → MP4</h1>
		<p class="text-muted-foreground mt-1">Combine an audio file and a still image into a YouTube-friendly MP4 video.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Audio</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if audioUrl}
					<audio src={audioUrl} controls class="w-full"></audio>
					<p class="text-muted-foreground text-xs">{audioFile?.name}</p>
					<Button variant="outline" class="w-full" onclick={() => { audioFile = null; if (audioUrl) URL.revokeObjectURL(audioUrl); audioUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="audio/*" label="Drop the audio file" onfiles={(f) => setAudio(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Cover image</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if imageUrl}
					<img src={imageUrl} alt="cover" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { imageFile = null; if (imageUrl) URL.revokeObjectURL(imageUrl); imageUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="image/*" label="Drop a cover image" onfiles={(f) => setImage(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if audioFile && imageFile}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Output</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="ow">Width</Label><Input id="ow" type="number" bind:value={outW} min="64" /></div>
					<div class="space-y-1.5"><Label for="oh">Height</Label><Input id="oh" type="number" bind:value={outH} min="64" /></div>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Build MP4"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="audio-video.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
