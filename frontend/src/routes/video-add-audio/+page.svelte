<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let video = $state<File | null>(null);
	let videoUrl = $state<string | null>(null);
	let audio = $state<File | null>(null);
	let audioUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let mode = $state<"replace" | "mix">("replace");
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(async () => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Muxing… ${p}%`; });
		try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; }
		return off;
	});

	function setVideo(f: File) {
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		video = f; videoUrl = URL.createObjectURL(f);
	}
	function setAudio(f: File) {
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		audio = f; audioUrl = URL.createObjectURL(f);
	}

	async function run() {
		if (!video || !audio || !loaded) return;
		busy = true; progress = 0; message = "Muxing…";
		try {
			const ff = await getFFmpeg();
			const vext = video.name.split(".").pop()?.toLowerCase() || "mp4";
			const aext = audio.name.split(".").pop()?.toLowerCase() || "mp3";
			await ff.writeFile(`v.${vext}`, await fetchFile(video));
			await ff.writeFile(`a.${aext}`, await fetchFile(audio));
			let args: string[];
			if (mode === "replace") {
				args = [
					"-i", `v.${vext}`,
					"-i", `a.${aext}`,
					"-map", "0:v:0", "-map", "1:a:0",
					"-c:v", "copy",
					"-c:a", "aac", "-b:a", "192k",
					"-shortest",
					"output.mp4"
				];
			} else {
				args = [
					"-i", `v.${vext}`,
					"-i", `a.${aext}`,
					"-filter_complex", "[0:a][1:a]amix=inputs=2:duration=shortest:dropout_transition=2[a]",
					"-map", "0:v:0", "-map", "[a]",
					"-c:v", "copy",
					"-c:a", "aac", "-b:a", "192k",
					"-shortest",
					"output.mp4"
				];
			}
			await ff.exec(args);
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
		<h1 class="text-3xl font-bold tracking-tight">Add Audio to Video</h1>
		<p class="text-muted-foreground mt-1">Replace or mix an audio track on a video. Output is MP4 (AAC).</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Video</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if videoUrl}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={videoUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={() => { video = null; if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="video/*" label="Drop the video file" onfiles={(f) => setVideo(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Audio</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if audioUrl}
					<audio src={audioUrl} controls class="w-full"></audio>
					<p class="text-muted-foreground text-xs">{audio?.name}</p>
					<Button variant="outline" class="w-full" onclick={() => { audio = null; if (audioUrl) URL.revokeObjectURL(audioUrl); audioUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="audio/*" label="Drop the audio file" onfiles={(f) => setAudio(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if video && audio}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Mix mode</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label>Mode</Label>
					<Select.Root type="single" bind:value={mode}>
						<Select.Trigger class="w-full">{mode === "replace" ? "Replace original audio" : "Mix with original"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="replace">Replace original audio</Select.Item>
							<Select.Item value="mix">Mix with original</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Mux"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="with-audio.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
