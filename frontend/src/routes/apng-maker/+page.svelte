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
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import X from "@lucide/svelte/icons/x";

	type Frame = { url: string; file: File };
	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let frames = $state<Frame[]>([]);
	let outUrl = $state<string | null>(null);
	let delayMs = $state(150);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(async () => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Encoding… ${p}%`; });
		try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; }
		return off;
	});

	function add(files: File[]) {
		const imgs = files.filter((f) => f.type.startsWith("image/"));
		frames = [...frames, ...imgs.map((f) => ({ url: URL.createObjectURL(f), file: f }))];
	}
	function remove(i: number) { URL.revokeObjectURL(frames[i].url); frames = frames.filter((_, j) => j !== i); }
	function move(i: number, j: number) {
		if (j < 0 || j >= frames.length) return;
		const a = [...frames]; const [m] = a.splice(i, 1); a.splice(j, 0, m); frames = a;
	}

	async function run() {
		if (!loaded || !frames.length) return;
		busy = true; progress = 0; message = "Encoding…";
		try {
			const ff = await getFFmpeg();
			const ext = frames[0].file.name.split(".").pop()?.toLowerCase() || "png";
			for (let i = 0; i < frames.length; i++) {
				const fext = frames[i].file.name.split(".").pop()?.toLowerCase() || "png";
				await ff.writeFile(`f_${i.toString().padStart(4, "0")}.${fext}`, await fetchFile(frames[i].file));
			}
			const fps = Math.max(0.1, 1000 / delayMs);
			await ff.exec([
				"-framerate", fps.toFixed(3),
				"-i", `f_%04d.${ext}`,
				"-plays", "0",
				"-f", "apng",
				"output.png"
			]);
			const data = await ff.readFile("output.png") as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "image/apng" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">APNG Maker</h1>
		<p class="text-muted-foreground mt-1">Build an animated PNG (APNG) from a sequence of images. APNG keeps full color and alpha.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<FileDrop accept="image/*" multiple label="Click or drag & drop images here (multi-select)" onfiles={add} />

	{#if frames.length}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Frames ({frames.length})</Card.Title></Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-3">
					{#each frames as fr, i (fr.url)}
						<div class="bg-card flex w-32 flex-col items-center gap-2 rounded-md border p-2">
							<img src={fr.url} alt="frame" class="h-20 w-full rounded object-contain" />
							<div class="flex w-full items-center gap-1">
								<Button variant="outline" size="icon-sm" onclick={() => move(i, i - 1)} disabled={i === 0}><ChevronLeft /></Button>
								<span class="text-muted-foreground flex-1 text-center text-xs">{i + 1}</span>
								<Button variant="outline" size="icon-sm" onclick={() => move(i, i + 1)} disabled={i === frames.length - 1}><ChevronRight /></Button>
								<Button variant="destructive" size="icon-sm" onclick={() => remove(i)}><X /></Button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5"><Label for="d">Frame delay (ms)</Label><Input id="d" type="number" bind:value={delayMs} min="20" /></div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Encode APNG"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="animation.png"><Download />Download APNG</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
