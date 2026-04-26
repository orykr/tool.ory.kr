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
	let file = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let videoEl = $state<HTMLVideoElement | null>(null);
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
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; videoUrl = URL.createObjectURL(f); outUrl = null;
	}

	function onMeta(ev: Event) {
		const v = ev.target as HTMLVideoElement;
		natW = v.videoWidth; natH = v.videoHeight;
		x = 0; y = 0;
		w = Math.floor(natW * 0.5); h = Math.floor(natH * 0.5);
	}

	function reset() {
		file = null;
		if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null;
		if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null;
	}

	async function run() {
		if (!file || !loaded) return;
		busy = true; progress = 0; message = "Cropping…";
		try {
			const ff = await getFFmpeg();
			const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
			await ff.writeFile(`input.${ext}`, await fetchFile(file));
			const sx = Number.isFinite(Number(x)) ? Number(x) : 0;
			const sy = Number.isFinite(Number(y)) ? Number(y) : 0;
			const sw = Number.isFinite(Number(w)) ? Number(w) : natW;
			const sh = Number.isFinite(Number(h)) ? Number(h) : natH;
			const cx = Math.max(0, Math.min(sx, natW - 2)) & ~1;
			const cy = Math.max(0, Math.min(sy, natH - 2)) & ~1;
			const cw = Math.max(2, Math.min(sw, natW - cx)) & ~1;
			const ch = Math.max(2, Math.min(sh, natH - cy)) & ~1;
			await ff.exec([
				"-i", `input.${ext}`,
				"-vf", `crop=${cw}:${ch}:${cx}:${cy}`,
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "copy",
				"-pix_fmt", "yuv420p",
				"output.mp4"
			]);
			const data = await ff.readFile("output.mp4") as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "video/mp4" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Video Cropper</h1>
		<p class="text-muted-foreground mt-1">Crop a video to a rectangle. Output is H.264 MP4.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="video/*" label="Click or drag & drop a video here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source ({natW}×{natH})</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="bg-muted relative inline-block w-full overflow-hidden rounded-md">
						<!-- svelte-ignore a11y_media_has_caption -->
						<video bind:this={videoEl} src={videoUrl} controls class="block w-full" onloadedmetadata={onMeta}></video>
						{#if natW > 0}
							<div class="border-primary bg-primary/10 pointer-events-none absolute border-2"
								style="left:{(x / natW) * 100}%;top:{(y / natH) * 100}%;width:{(w / natW) * 100}%;height:{(h / natH) * 100}%"
							></div>
						{/if}
					</div>
					<Button variant="outline" class="w-full" onclick={reset}>Change Video</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Crop region (px)</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5"><Label for="cx">X</Label><Input id="cx" type="number" bind:value={x} min="0" /></div>
						<div class="space-y-1.5"><Label for="cy">Y</Label><Input id="cy" type="number" bind:value={y} min="0" /></div>
						<div class="space-y-1.5"><Label for="cw">Width</Label><Input id="cw" type="number" bind:value={w} min="2" /></div>
						<div class="space-y-1.5"><Label for="ch">Height</Label><Input id="ch" type="number" bind:value={h} min="2" /></div>
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
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="cropped.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
