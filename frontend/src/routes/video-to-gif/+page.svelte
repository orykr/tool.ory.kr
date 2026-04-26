<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress, onFFmpegLog } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
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
	let colors = $state([128]);
	let dither = $state("sierra2_4a");
	let scaler = $state("lanczos");
	let statsMode = $state("full");
	let loopCount = $state(0);

	let isError = $derived(message.toLowerCase().includes("failed"));

	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => {
			progress = p;
			if (isConverting) message = `Converting… ${p}%`;
		});
		const offLog = onFFmpegLog((line) => console.log("[ffmpeg]", line));
		(async () => {
			try {
				await getFFmpeg();
				loaded = true;
				message = "FFmpeg loaded. Ready to convert.";
			} catch (e) {
				message = "Failed to load FFmpeg.";
				console.error(e);
			}
		})();
		return () => { off(); offLog(); };
	});

	function setVideo(file: File) {
		runSeq++;
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		if (gifUrl) URL.revokeObjectURL(gifUrl);
		videoFile = file;
		videoUrl = URL.createObjectURL(file);
		gifUrl = null;
	}

	async function convert() {
		if (!videoFile || !loaded) return;
		const seq = ++runSeq;
		isConverting = true;
		progress = 0;
		message = "Starting conversion…";
		try {
			const ff = await getFFmpeg();
			const inputExt = (videoFile.name.split(".").pop() || "mp4").toLowerCase();
			const inputName = `input.${inputExt}`;
			await ff.writeFile(inputName, await fetchFile(videoFile));
			const cRaw = Number(colors?.[0]);
			const nColors = Math.max(2, Math.min(256, Number.isFinite(cRaw) ? cRaw : 128));
			const loop = Math.max(0, Math.min(65535, Number.isFinite(Number(loopCount)) ? Number(loopCount) : 0));
			const filter = `fps=${fps},scale=${width}:-1:flags=${scaler},split[a][b];[a]palettegen=max_colors=${nColors}:stats_mode=${statsMode}[p];[b][p]paletteuse=dither=${dither}`;
			try { await ff.deleteFile("output.gif"); } catch { /* ignore */ }
			await ff.exec([
				"-ss", String(startTime),
				"-t", String(duration),
				"-i", inputName,
				"-filter_complex", filter,
				"-loop", String(loop === 0 ? 0 : loop - 1),
				"output.gif"
			]);
			if (seq !== runSeq) return;
			const data = await ff.readFile("output.gif");
			const buf = (data as Uint8Array).buffer;
			const blob = new Blob([buf], { type: "image/gif" });
			if (gifUrl) URL.revokeObjectURL(gifUrl);
			gifUrl = URL.createObjectURL(blob);
			message = "Conversion complete!";
		} catch (e) {
			console.error(e);
			if (seq === runSeq) message = "Conversion failed.";
		} finally {
			if (seq === runSeq) isConverting = false;
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
					<Button variant="outline" class="w-full" onclick={() => { runSeq++; videoFile = null; if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; if (gifUrl) URL.revokeObjectURL(gifUrl); gifUrl = null; }}>Change Video</Button>
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
							<Input id="fps" type="number" bind:value={fps} min="1" max="60" />
						</div>
						<div class="space-y-1.5">
							<Label for="vid-width">Width (px)</Label>
							<Input id="vid-width" type="number" bind:value={width} min="50" step="10" />
						</div>
					</div>

					<div class="space-y-2 border-t pt-3">
						<p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Quality</p>
						<div class="flex items-center justify-between"><Label>Max colors</Label><span class="text-muted-foreground text-sm">{colors[0]}</span></div>
						<Slider type="multiple" bind:value={colors} min={2} max={256} step={1} />
						<p class="text-muted-foreground text-xs">More colors = better quality, larger file. Default 128.</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5">
							<Label>Dither</Label>
							<Select.Root type="single" bind:value={dither}>
								<Select.Trigger class="w-full">{dither}</Select.Trigger>
								<Select.Content>
									<Select.Item value="sierra2_4a">sierra2_4a (default)</Select.Item>
									<Select.Item value="sierra2">sierra2</Select.Item>
									<Select.Item value="floyd_steinberg">floyd_steinberg</Select.Item>
									<Select.Item value="bayer">bayer (cross-hatch)</Select.Item>
									<Select.Item value="none">none (banded)</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-1.5">
							<Label>Scaler</Label>
							<Select.Root type="single" bind:value={scaler}>
								<Select.Trigger class="w-full">{scaler}</Select.Trigger>
								<Select.Content>
									<Select.Item value="lanczos">lanczos (best)</Select.Item>
									<Select.Item value="bicubic">bicubic</Select.Item>
									<Select.Item value="bilinear">bilinear</Select.Item>
									<Select.Item value="neighbor">neighbor (pixel art)</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-1.5">
							<Label>Palette mode</Label>
							<Select.Root type="single" bind:value={statsMode}>
								<Select.Trigger class="w-full">{statsMode}</Select.Trigger>
								<Select.Content>
									<Select.Item value="full">full (whole clip)</Select.Item>
									<Select.Item value="diff">diff (motion-aware)</Select.Item>
									<Select.Item value="single">single (per-frame)</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-1.5">
							<Label for="loop">Loop count (0 = ∞)</Label>
							<Input id="loop" type="number" bind:value={loopCount} min="0" max="65535" />
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
