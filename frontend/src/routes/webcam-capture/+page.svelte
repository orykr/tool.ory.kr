<script lang="ts">
	import { onDestroy } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";
	import Camera from "@lucide/svelte/icons/camera";
	import Square from "@lucide/svelte/icons/square";

	let stream = $state<MediaStream | null>(null);
	let recorder: MediaRecorder | null = null;
	let videoEl = $state<HTMLVideoElement | null>(null);
	let recording = $state(false);
	let chunks: Blob[] = [];
	let outUrl = $state<string | null>(null);
	let outMime = $state<string>("video/webm");
	let destroyed = false;
	let withAudio = $state(true);
	let resolution = $state<"480" | "720" | "1080">("720");
	let message = $state("Click Start to enable your camera.");

	async function start() {
		message = "Requesting camera permission…";
		try {
			const dim = resolution === "480" ? { width: 640, height: 480 } : resolution === "720" ? { width: 1280, height: 720 } : { width: 1920, height: 1080 };
			const s = await navigator.mediaDevices.getUserMedia({
				video: { ...dim },
				audio: withAudio
			});
			stream = s;
			if (videoEl) {
				videoEl.srcObject = s;
				await videoEl.play();
			}
			message = "Camera ready. Click Record to start capturing.";
		} catch (e) {
			console.error(e);
			message = "Failed to access camera.";
		}
	}

	function stopStream() {
		if (recorder && recorder.state !== "inactive") recorder.stop();
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		if (videoEl) videoEl.srcObject = null;
		message = "Camera stopped.";
	}

	function record() {
		if (!stream) return;
		chunks = [];
		const mimeChoices = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
		let chosen = "video/webm";
		for (const m of mimeChoices) {
			if (MediaRecorder.isTypeSupported(m)) { chosen = m; break; }
		}
		recorder = new MediaRecorder(stream, { mimeType: chosen });
		recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };
		recorder.onstop = () => {
			if (destroyed) return;
			const blob = new Blob(chunks, { type: chosen.split(";")[0] });
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(blob);
			outMime = chosen.split(";")[0];
			recording = false;
			message = "Recording saved.";
		};
		recorder.start();
		recording = true;
		message = "Recording…";
	}

	function stopRec() {
		if (recorder && recorder.state !== "inactive") recorder.stop();
	}

	onDestroy(() => {
		destroyed = true;
		if (recorder) recorder.onstop = null;
		stopStream();
		if (outUrl) URL.revokeObjectURL(outUrl);
	});
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Webcam Capture</h1>
		<p class="text-muted-foreground mt-1">Record your webcam (and optionally microphone) entirely in the browser. Output is WebM. Use Video Format Converter to convert to MP4.</p>
	</header>
	<div class="mb-6 rounded-md border bg-muted text-muted-foreground p-4 text-center text-sm">{message}</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Camera</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div class="bg-muted overflow-hidden rounded-md aspect-video">
					<!-- svelte-ignore a11y_media_has_caption -->
					<video bind:this={videoEl} autoplay muted playsinline class="block h-full w-full object-cover"></video>
				</div>
				{#if !stream}
					<Button class="w-full" onclick={start}><Camera />Start Camera</Button>
				{:else}
					<Button variant="outline" class="w-full" onclick={stopStream}>Stop Camera</Button>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label>Resolution</Label>
					<Select.Root type="single" bind:value={resolution}>
						<Select.Trigger class="w-full">{resolution === "480" ? "480p" : resolution === "720" ? "720p" : "1080p"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="480">640×480 (480p)</Select.Item>
							<Select.Item value="720">1280×720 (720p)</Select.Item>
							<Select.Item value="1080">1920×1080 (1080p)</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={withAudio} disabled={!!stream} /> Capture microphone</label>
				{#if !recording}
					<Button class="w-full" onclick={record} disabled={!stream}><Camera />Record</Button>
				{:else}
					<Button variant="destructive" class="w-full" onclick={stopRec}><Square />Stop Recording</Button>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Recording</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="webcam.webm"><Download />Download WebM</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
