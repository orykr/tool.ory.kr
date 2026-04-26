<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
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
	let busy = $state(false);
	let baseFile = $state<File | null>(null);
	let baseUrl = $state<string | null>(null);
	let pipFile = $state<File | null>(null);
	let pipUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let position = $state<"tl" | "tr" | "bl" | "br">("br");
	let scalePct = $state(25);
	let margin = $state(20);
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Compositing… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setBase(f: File) { if (baseUrl) URL.revokeObjectURL(baseUrl); baseFile = f; baseUrl = URL.createObjectURL(f); }
	function setPip(f: File) { if (pipUrl) URL.revokeObjectURL(pipUrl); pipFile = f; pipUrl = URL.createObjectURL(f); }

	async function run() {
		if (!baseFile || !pipFile || !loaded) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Compositing…";
		try {
			const ff = await getFFmpeg();
			const baseExt = baseFile.name.split(".").pop()?.toLowerCase() || "mp4";
			const pipExt = pipFile.name.split(".").pop()?.toLowerCase() || "mp4";
			await ff.writeFile(`base.${baseExt}`, await fetchFile(baseFile));
			await ff.writeFile(`pip.${pipExt}`, await fetchFile(pipFile));
			const sf = Math.max(5, Math.min(80, scalePct)) / 100;
			const m = Math.max(0, Math.min(500, Number(margin) || 0));
			let pos: string;
			if (position === "tl") pos = `${m}:${m}`;
			else if (position === "tr") pos = `main_w-overlay_w-${m}:${m}`;
			else if (position === "bl") pos = `${m}:main_h-overlay_h-${m}`;
			else pos = `main_w-overlay_w-${m}:main_h-overlay_h-${m}`;
			const filter = `[1:v]scale=iw*${sf}:-1[pip];[0:v][pip]overlay=${pos}:eof_action=pass`;
			await ff.exec([
				"-i", `base.${baseExt}`,
				"-i", `pip.${pipExt}`,
				"-filter_complex", filter,
				"-map", "0:a?",
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "aac", "-b:a", "192k",
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
			if (seq === runSeq) message = "Failed.";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Picture-in-Picture (Video on Video)</h1>
		<p class="text-muted-foreground mt-1">Composite a smaller video on top of a base video at a chosen corner.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Base video</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if baseUrl}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={baseUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={() => { baseFile = null; if (baseUrl) URL.revokeObjectURL(baseUrl); baseUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="video/*" label="Drop the base video" onfiles={(f) => setBase(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">PiP video</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				{#if pipUrl}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={pipUrl} controls class="w-full rounded-md"></video>
					<Button variant="outline" class="w-full" onclick={() => { pipFile = null; if (pipUrl) URL.revokeObjectURL(pipUrl); pipUrl = null; }}>Change</Button>
				{:else}
					<FileDrop accept="video/*" label="Drop the overlay video" onfiles={(f) => setPip(f[0])} />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if baseFile && pipFile}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Position & Style</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label>Corner</Label>
					<Select.Root type="single" bind:value={position}>
						<Select.Trigger class="w-full">{position === "tl" ? "Top-left" : position === "tr" ? "Top-right" : position === "bl" ? "Bottom-left" : "Bottom-right"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="tl">Top-left</Select.Item>
							<Select.Item value="tr">Top-right</Select.Item>
							<Select.Item value="bl">Bottom-left</Select.Item>
							<Select.Item value="br">Bottom-right</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="sc">Overlay size (%)</Label><Input id="sc" type="number" bind:value={scalePct} min="5" max="80" /></div>
					<div class="space-y-1.5"><Label for="mg">Margin (px)</Label><Input id="mg" type="number" bind:value={margin} min="0" max="500" /></div>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Composite"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="pip.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
