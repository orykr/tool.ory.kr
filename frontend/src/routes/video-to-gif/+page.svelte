<script lang="ts">
	import { FFmpeg } from "@ffmpeg/ffmpeg";
	import { fetchFile, toBlobURL } from "@ffmpeg/util";
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Download from "@lucide/svelte/icons/download";

	let ffmpeg: FFmpeg | null = null;
	let loaded = $state(false);
	let message = $state("Loading FFmpeg...");
	let progress = $state(0);

	let videoFile = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let gifUrl = $state<string | null>(null);
	let isConverting = $state(false);

	let fps = $state(10);
	let width = $state(320);
	let startTime = $state(0);
	let duration = $state(5);

	let isError = $derived(message.includes("Failed"));

	onMount(async () => {
		await load();
	});

	async function load() {
		ffmpeg = new FFmpeg();
		ffmpeg.on("log", ({ message: msg }) => console.log(msg));
		ffmpeg.on("progress", ({ progress: p }) => {
			progress = Math.round(p * 100);
			message = `Converting... ${progress}%`;
		});

		const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
		try {
			await ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm")
			});
			loaded = true;
			message = "FFmpeg loaded. Ready to convert.";
		} catch (e) {
			console.error(e);
			message = "Failed to load FFmpeg. Please check console.";
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			videoFile = file;
			videoUrl = URL.createObjectURL(file);
			gifUrl = null;
		}
	}

	async function convertToGif() {
		if (!ffmpeg || !loaded || !videoFile) return;

		isConverting = true;
		message = "Starting conversion...";

		try {
			const inputName = "input.mp4";
			const outputName = "output.gif";

			await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

			await ffmpeg.exec([
				"-i", inputName,
				"-ss", startTime.toString(),
				"-t", duration.toString(),
				"-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
				"-c:v", "gif",
				outputName
			]);

			const data = await ffmpeg.readFile(outputName);
			// @ts-ignore
			const blob = new Blob([data], { type: "image/gif" });
			gifUrl = URL.createObjectURL(blob);
			message = "Conversion complete!";
		} catch (e) {
			console.error(e);
			message = "Conversion failed.";
		} finally {
			isConverting = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith("video/")) {
			videoFile = file;
			videoUrl = URL.createObjectURL(file);
			gifUrl = null;
		}
	}

	function changeVideo() {
		videoFile = null;
		videoUrl = null;
		gifUrl = null;
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Video to GIF Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert video files to optimized animated GIFs in your browser.
		</p>
	</header>

	<div
		class="mb-6 rounded-md border p-4 text-center text-sm {isError
			? 'border-destructive/50 bg-destructive/10 text-destructive'
			: 'border-border bg-muted text-muted-foreground'}"
	>
		{message}
		{#if isConverting}
			<Progress value={progress} max={100} class="mt-3" />
		{/if}
	</div>

	{#if !videoFile}
		<button
			type="button"
			class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground border-border flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-16 text-center transition-colors"
			onclick={() => document.getElementById("video-input")?.click()}
			ondragover={handleDragOver}
			ondrop={handleDrop}
		>
			<Upload class="h-10 w-10" />
			<p class="text-base font-medium">Click or Drag & Drop a video file here</p>
			<input
				id="video-input"
				type="file"
				accept="video/*"
				onchange={handleFileSelect}
				class="hidden"
			/>
		</button>
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Source Video</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={videoUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={changeVideo}>Change Video</Button>
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
							<Input
								id="start-time"
								type="number"
								bind:value={startTime}
								min="0"
								step="0.1"
							/>
						</div>
						<div class="space-y-1.5">
							<Label for="duration">Duration (sec)</Label>
							<Input
								id="duration"
								type="number"
								bind:value={duration}
								min="0.1"
								step="0.1"
							/>
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

					<Button class="w-full" onclick={convertToGif} disabled={!loaded || isConverting}>
						{isConverting ? "Converting..." : "Convert to GIF"}
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
