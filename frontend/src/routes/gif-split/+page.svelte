<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import { makeZip, type ZipEntry } from "$lib/zip";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
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
	let inputUrl = $state<string | null>(null);
	let frames = $state<{ name: string; url: string; data: Uint8Array }[]>([]);
	let zipUrl = $state<string | null>(null);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(async () => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Splitting… ${p}%`; });
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
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		file = f; inputUrl = URL.createObjectURL(f);
	}

	async function run() {
		if (!file || !loaded) return;
		busy = true; progress = 0; message = "Splitting…";
		clearFrames();
		try {
			const ff = await getFFmpeg();
			await ff.writeFile("input.gif", await fetchFile(file));
			await ff.exec(["-i", "input.gif", "-vsync", "0", "frame_%04d.png"]);
			const out: typeof frames = [];
			for (let i = 1; i <= FRAME_LIMIT; i++) {
				const name = `frame_${i.toString().padStart(4, "0")}.png`;
				try {
					const data = await ff.readFile(name) as Uint8Array;
					if (!data || data.length === 0) break;
					const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
					const url = URL.createObjectURL(new Blob([buf], { type: "image/png" }));
					out.push({ name, url, data });
				} catch { break; }
			}
			frames = out;
			if (out.length === 0) { message = "No frames found."; return; }
			const entries: ZipEntry[] = out.map((f) => ({ name: f.name, data: f.data }));
			const zip = makeZip(entries);
			zipUrl = URL.createObjectURL(zip);
			message = `Extracted ${out.length} frame${out.length === 1 ? "" : "s"}.`;
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Split GIF into Frames</h1>
		<p class="text-muted-foreground mt-1">Decode every frame of an animated GIF as a separate PNG. Up to {FRAME_LIMIT} frames per run.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="image/gif" label="Click or drag & drop a GIF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="mb-6 grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={inputUrl} alt="source" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { clearFrames(); file = null; if (inputUrl) URL.revokeObjectURL(inputUrl); inputUrl = null; }}>Change GIF</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Action</Card.Title></Card.Header>
				<Card.Content>
					<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Extract Frames"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if frames.length}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Frames ({frames.length})</Card.Title>
				{#if zipUrl}
					<Button href={zipUrl} download="frames.zip"><Download />Download ZIP</Button>
				{/if}
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each frames as fr (fr.name)}
						<a href={fr.url} download={fr.name} class="border-input hover:border-primary block rounded border p-1 text-center text-xs">
							<img src={fr.url} alt={fr.name} class="mb-1 w-full rounded" />
							{fr.name}
						</a>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
