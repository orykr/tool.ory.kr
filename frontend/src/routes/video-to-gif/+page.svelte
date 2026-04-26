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
	let videoFile = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let gifUrl = $state<string | null>(null);
	let isConverting = $state(false);

	let fps = $state(10);
	let width = $state(320);
	let startTime = $state(0);
	let duration = $state(5);

	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(async () => {
		const off = onFFmpegProgress((p) => {
			progress = p;
			if (isConverting) message = `Converting… ${p}%`;
		});
		try {
			await getFFmpeg();
			loaded = true;
			message = "FFmpeg loaded. Ready to convert.";
		} catch (e) {
			message = "Failed to load FFmpeg.";
			console.error(e);
		}
		return off;
	});

	function setVideo(file: File) {
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		if (gifUrl) URL.revokeObjectURL(gifUrl);
		videoFile = file;
		videoUrl = URL.createObjectURL(file);
		gifUrl = null;
	}

	async function convert() {
		if (!videoFile || !loaded) return;
		isConverting = true;
		progress = 0;
		message = "Starting conversion…";
		try {
			const ff = await getFFmpeg();
			await ff.writeFile("input.bin", await fetchFile(videoFile));
			await ff.exec([
				"-i", "input.bin",
				"-ss", String(startTime),
				"-t", String(duration),
				"-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
				"-c:v", "gif",
				"output.gif"
			]);
			const data = await ff.readFile("output.gif");
			const buf = (data as Uint8Array).buffer;
			const blob = new Blob([buf], { type: "image/gif" });
			if (gifUrl) URL.revokeObjectURL(gifUrl);
			gifUrl = URL.createObjectURL(blob);
			message = "Conversion complete!";
		} catch (e) {
			console.error(e);
			message = "Conversion failed.";
		} finally {
			isConverting = false;
		}
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Video to GIF Converter</h1>
		<p class="text-muted-foreground mt-1">Convert video files to animated GIFs entirely in your browser.</p>
	</header>

	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">
		{message}
		{#if isConverting}
			<Progress value={progress} max={100} class="mt-3" />
		{/if}
	</div>

	{#if !videoFile}
		<FileDrop accept="video/*" label="Click or drag & drop a video file here" onfiles={(f) => setVideo(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Source Video</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={videoUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={() => { videoFile = null; if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; gifUrl = null; }}>Change Video</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Conversion Settings</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5">
							<Label for="start-time">Start (sec)</Label>
							<Input id="start-time" type="number" bind:value={startTime} min="0" step="0.1" />
						</div>
						<div class="space-y-1.5">
							<Label for="duration">Duration (sec)</Label>
							<Input id="duration" type="number" bind:value={duration} min="0.1" step="0.1" />
						</div>
						<div class="space-y-1.5">
							<Label for="fps">FPS</Label>
							<Input id="fps" type="number" bind:value={fps} min="1" max="30" />
						</div>
						<div class="space-y-1.5">
							<Label for="vid-width">Width (px)</Label>
							<Input id="vid-width" type="number" bind:value={width} min="50" step="10" />
						</div>
					</div>
					<Button class="w-full" onclick={convert} disabled={!loaded || isConverting}>
						{isConverting ? "Converting…" : "Convert to GIF"}
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if gifUrl}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title class="text-base">Generated GIF</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={gifUrl} alt="Result GIF" class="max-w-full rounded-md shadow-md" />
				<Button href={gifUrl} download="converted.gif" class="w-full sm:w-auto">
					<Download />
					Download GIF
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
