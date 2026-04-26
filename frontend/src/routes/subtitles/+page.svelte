<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let videoFile = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let mode = $state<"file" | "paste">("file");
	let srtFile = $state<File | null>(null);
	let pastedSrt = $state(`1\n00:00:00,000 --> 00:00:03,000\nHello world\n\n2\n00:00:03,000 --> 00:00:06,000\nSecond line`);
	let fontSize = $state(24);
	let fontColor = $state("#ffffff");
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Burning subs… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setVideo(f: File) { if (videoUrl) URL.revokeObjectURL(videoUrl); videoFile = f; videoUrl = URL.createObjectURL(f); }

	function colorToHex(c: string) {
		const m = /^#([0-9a-fA-F]{6})$/.exec(c);
		if (!m) return "FFFFFF";
		const r = m[1].slice(0, 2); const g = m[1].slice(2, 4); const b = m[1].slice(4, 6);
		return `${b}${g}${r}`;
	}

	async function run() {
		if (!videoFile || !loaded) return;
		if (mode === "file" && !srtFile) return;
		if (mode === "paste" && !pastedSrt.trim()) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Preparing subtitles…";
		try {
			const ff = await getFFmpeg();
			const vext = videoFile.name.split(".").pop()?.toLowerCase() || "mp4";
			await ff.writeFile(`v.${vext}`, await fetchFile(videoFile));
			const srtBytes = mode === "file" && srtFile
				? new Uint8Array(await srtFile.arrayBuffer())
				: new TextEncoder().encode(pastedSrt);
			await ff.writeFile("subs.srt", srtBytes);
			const fs = Math.max(8, Math.min(200, fontSize));
			const c = colorToHex(fontColor);
			const style = `FontSize=${fs},PrimaryColour=&H00${c}&,Outline=1,Shadow=0`;
			const filter = `subtitles=subs.srt:force_style='${style}'`;
			message = "Encoding…";
			await ff.exec([
				"-i", `v.${vext}`,
				"-vf", filter,
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "copy",
				"-pix_fmt", "yuv420p",
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
			if (seq === runSeq) message = "Failed (the bundled FFmpeg core may not include libass).";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Burn-in Subtitles</h1>
		<p class="text-muted-foreground mt-1">Hard-burn an SRT subtitle file into a video so the captions become part of the picture.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Video</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			{#if videoUrl}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={videoUrl} controls class="w-full rounded-md"></video>
				<Button variant="outline" class="w-full" onclick={() => { videoFile = null; if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; }}>Change video</Button>
			{:else}
				<FileDrop accept="video/*" label="Drop the video" onfiles={(f) => setVideo(f[0])} />
			{/if}
		</Card.Content>
	</Card.Root>

	{#if videoFile}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Subtitles (SRT)</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex gap-2">
					<Button variant={mode === "file" ? "default" : "outline"} onclick={() => mode = "file"}>Upload .srt</Button>
					<Button variant={mode === "paste" ? "default" : "outline"} onclick={() => mode = "paste"}>Paste SRT</Button>
				</div>
				{#if mode === "file"}
					{#if srtFile}
						<p class="text-sm">Loaded: {srtFile.name}</p>
						<Button variant="outline" onclick={() => srtFile = null}>Change SRT</Button>
					{:else}
						<FileDrop accept=".srt,text/plain" label="Drop the .srt file" onfiles={(f) => srtFile = f[0]} />
					{/if}
				{:else}
					<Textarea rows={8} bind:value={pastedSrt} class="font-mono text-xs" />
				{/if}
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="fs">Font size</Label><Input id="fs" type="number" bind:value={fontSize} min="8" max="200" /></div>
					<div class="space-y-1.5"><Label for="fc">Color</Label><input id="fc" type="color" bind:value={fontColor} class="h-9 w-full rounded border" /></div>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Burn subtitles"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="subbed.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
