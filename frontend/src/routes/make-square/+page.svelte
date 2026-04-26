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
	let file = $state<File | null>(null);
	let inputUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let outIsGif = $state(false);
	let mode = $state<"pad" | "crop">("pad");
	let bg = $state("#000000");
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Working… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setFile(f: File) {
		runSeq++;
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; inputUrl = URL.createObjectURL(f); outUrl = null;
	}

	function reset() {
		runSeq++;
		file = null;
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		inputUrl = null;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = null;
	}

	async function run() {
		if (!file || !loaded) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Working…";
		try {
			const ff = await getFFmpeg();
			const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
			const isGif = file.type === "image/gif" || ext === "gif";
			const inputName = `input.${ext}`;
			await ff.writeFile(inputName, await fetchFile(file));
			const m = /^#([0-9a-fA-F]{6})$/.exec(bg);
			const c = m ? `0x${m[1]}` : "0x000000";
			const filter = mode === "pad"
				? `pad=max(iw\\,ih):max(iw\\,ih):(ow-iw)/2:(oh-ih)/2:color=${c}`
				: `crop=min(iw\\,ih):min(iw\\,ih)`;
			let outputName: string;
			let args: string[];
			if (isGif) {
				outputName = "output.gif";
				args = ["-i", inputName, "-filter_complex", `${filter},split[a][b];[a]palettegen[p];[b][p]paletteuse`, outputName];
			} else {
				outputName = "output.mp4";
				args = [
					"-i", inputName,
					"-vf", `${filter},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
					"-c:v", "libx264", "-preset", "medium", "-crf", "23",
					"-c:a", "copy",
					"-pix_fmt", "yuv420p",
					outputName
				];
			}
			await ff.exec(args);
			if (seq !== runSeq) return;
			const data = await ff.readFile(outputName) as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: isGif ? "image/gif" : "video/mp4" }));
			outIsGif = isGif;
			message = "Done.";
		} catch (e) {
			console.error(e);
			if (seq === runSeq) message = "Failed.";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Make Square (1:1)</h1>
		<p class="text-muted-foreground mt-1">Convert a GIF or video to a 1:1 square aspect ratio by padding or center-cropping. GIF input → GIF output; video input → MP4 output.</p>
	</header>

	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">
		{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}
	</div>

	{#if !file}
		<FileDrop accept="image/gif,video/*" label="Click or drag & drop a GIF or video here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					{#if file.type.startsWith("video/")}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video src={inputUrl} controls class="w-full rounded-md"></video>
					{:else}
						<img src={inputUrl} alt="src" class="w-full rounded-md" />
					{/if}
					<Button variant="outline" class="w-full" onclick={reset}>Change file</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label>Mode</Label>
						<Select.Root type="single" bind:value={mode}>
							<Select.Trigger class="w-full">{mode === "pad" ? "Pad with color (no crop)" : "Center crop (no pad)"}</Select.Trigger>
							<Select.Content>
								<Select.Item value="pad">Pad with color (no crop)</Select.Item>
								<Select.Item value="crop">Center crop (no pad)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					{#if mode === "pad"}
						<div class="space-y-1.5"><Label for="bg">Pad color</Label><input id="bg" type="color" bind:value={bg} class="h-9 w-full rounded border" /></div>
					{/if}
					<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Make square"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				{#if outIsGif}
					<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				{:else}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				{/if}
				<Button href={outUrl} download={outIsGif ? "square.gif" : "square.mp4"}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
