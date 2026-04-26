<script lang="ts">
	import { onDestroy } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";
	import Monitor from "@lucide/svelte/icons/monitor";
	import Square from "@lucide/svelte/icons/square";

	let stream = $state<MediaStream | null>(null);
	let recorder: MediaRecorder | null = null;
	let recording = $state(false);
	let chunks: Blob[] = [];
	let outUrl = $state<string | null>(null);
	let withAudio = $state(true);
	let message = $state("Click Start to pick a screen or window.");
	let destroyed = false;

	async function start() {
		message = "Requesting screen permission…";
		try {
			const s = await navigator.mediaDevices.getDisplayMedia({
				video: { frameRate: 30 },
				audio: withAudio
			});
			stream = s;
			s.getVideoTracks()[0].onended = () => stop();
			message = "Recording…";
			chunks = [];
			const mimeChoices = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
			let chosen = "video/webm";
			for (const m of mimeChoices) {
				if (MediaRecorder.isTypeSupported(m)) { chosen = m; break; }
			}
			recorder = new MediaRecorder(s, { mimeType: chosen });
			recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };
			recorder.onstop = () => {
				if (destroyed) return;
				const blob = new Blob(chunks, { type: chosen.split(";")[0] });
				if (outUrl) URL.revokeObjectURL(outUrl);
				outUrl = URL.createObjectURL(blob);
				recording = false;
				message = "Recording saved.";
			};
			recorder.start();
			recording = true;
		} catch (e) {
			console.error(e);
			message = "Failed to capture screen.";
		}
	}

	function stop() {
		if (recorder && recorder.state !== "inactive") recorder.stop();
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
	}

	onDestroy(() => {
		destroyed = true;
		if (recorder) recorder.onstop = null;
		stop();
		if (outUrl) URL.revokeObjectURL(outUrl);
	});
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Screen Recorder</h1>
		<p class="text-muted-foreground mt-1">Record your screen, window, or browser tab via the Screen Capture API. Output is WebM. Use Video Format Converter to make MP4.</p>
	</header>
	<div class="mb-6 rounded-md border bg-muted text-muted-foreground p-4 text-center text-sm">{message}</div>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Recording</Card.Title></Card.Header>
		<Card.Content class="space-y-4">
			<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={withAudio} disabled={recording} /> Capture system / tab audio (where supported)</label>
			{#if !recording}
				<Button class="w-full" onclick={start}><Monitor />Start Recording</Button>
			{:else}
				<Button variant="destructive" class="w-full" onclick={stop}><Square />Stop Recording</Button>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Recording</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="screen.webm"><Download />Download WebM</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
