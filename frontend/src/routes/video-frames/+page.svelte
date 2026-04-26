<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import { makeZip, type ZipEntry } from "$lib/zip";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	const FRAME_LIMIT = 500;
	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let file = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let frames = $state<{ name: string; url: string; data: Uint8Array }[]>([]);
	let zipUrl = $state<string | null>(null);
	let format = $state<"png" | "jpg">("png");
	let fps = $state(1);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(async () => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Extracting… ${p}%`; });
		try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; }
		return off;
	});

	function clearFrames() {
		for (const f of frames) URL.revokeObjectURL(f.url);
		frames = [];
		if (zipUrl) URL.revokeObjectURL(zipUrl);
		zipUrl = null;
	}
	function setFile(f: File) {
		clearFrames();
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		file = f; videoUrl = URL.createObjectURL(f);
	}

	async function run() {
		if (!file || !loaded) return;
		busy = true; progress = 0; message = "Extracting…";
		clearFrames();
		try {
			const ff = await getFFmpeg();
			const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
			await ff.writeFile(`input.${ext}`, await fetchFile(file));
			const fpsClamped = Math.max(0.1, Math.min(60, Number(fps) || 1));
			await ff.exec([
				"-i", `input.${ext}`,
				"-vf", `fps=${fpsClamped}`,
				"-frames:v", String(FRAME_LIMIT),
				`frame_%04d.${format}`
			]);
			const out: typeof frames = [];
			for (let i = 1; i <= FRAME_LIMIT; i++) {
				const name = `frame_${i.toString().padStart(4, "0")}.${format}`;
				try {
					const data = await ff.readFile(name) as Uint8Array;
					if (!data || data.length === 0) break;
					const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
					const url = URL.createObjectURL(new Blob([buf], { type: format === "png" ? "image/png" : "image/jpeg" }));
					out.push({ name, url, data });
				} catch { break; }
			}
			frames = out;
			if (out.length === 0) { message = "No frames extracted."; return; }
			const entries: ZipEntry[] = out.map((f) => ({ name: f.name, data: f.data }));
			zipUrl = URL.createObjectURL(makeZip(entries));
			message = `Extracted ${out.length} frame${out.length === 1 ? "" : "s"}.`;
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Extract Video Frames</h1>
		<p class="text-muted-foreground mt-1">Extract still frames from a video at a chosen rate. Up to {FRAME_LIMIT} frames per run.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="video/*" label="Click or drag & drop a video here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="mb-6 grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={videoUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={() => { clearFrames(); file = null; if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; }}>Change Video</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5"><Label for="f">Frames per second</Label><Input id="f" type="number" bind:value={fps} min="0.1" max="60" step="0.5" /></div>
					<div class="space-y-1.5">
						<Label>Format</Label>
						<Select.Root type="single" bind:value={format}>
							<Select.Trigger class="w-full">{format.toUpperCase()}</Select.Trigger>
							<Select.Content>
								<Select.Item value="png">PNG (lossless)</Select.Item>
								<Select.Item value="jpg">JPG (smaller)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Extract Frames"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if frames.length}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Frames ({frames.length})</Card.Title>
				{#if zipUrl}<Button href={zipUrl} download="frames.zip"><Download />Download ZIP</Button>{/if}
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each frames as fr (fr.name)}
						<a href={fr.url} download={fr.name} class="border-input hover:border-primary block rounded border p-1 text-center text-xs">
							<img src={fr.url} alt={fr.name} class="mb-1 w-full rounded" />{fr.name}
						</a>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
