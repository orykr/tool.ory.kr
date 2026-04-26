<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
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
	let file = $state<File | null>(null);
	let inputUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let natW = $state(0);
	let natH = $state(0);

	let text = $state("Hello!");
	let position = $state<"top" | "center" | "bottom">("bottom");
	let fontSize = $state(36);
	let color = $state("#ffffff");
	let stroke = $state("#000000");
	let strokeWidth = $state(3);
	let fontFamily = $state("Impact, Arial Black, sans-serif");
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Adding text… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setFile(f: File) {
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; inputUrl = URL.createObjectURL(f); outUrl = null;
	}
	function onImgLoad(ev: Event) { const t = ev.target as HTMLImageElement; natW = t.naturalWidth; natH = t.naturalHeight; }
	function reset() { file = null; if (inputUrl) URL.revokeObjectURL(inputUrl); inputUrl = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; }

	function renderTextOverlay(): Promise<Uint8Array> {
		return new Promise((resolve, reject) => {
			const cnv = document.createElement("canvas");
			cnv.width = natW; cnv.height = natH;
			const ctx = cnv.getContext("2d");
			if (!ctx) { reject(new Error("No 2d context")); return; }
			ctx.clearRect(0, 0, natW, natH);
			ctx.font = `bold ${fontSize}px ${fontFamily}`;
			ctx.textAlign = "center";
			ctx.textBaseline = position === "top" ? "top" : position === "bottom" ? "bottom" : "middle";
			const yPos = position === "top" ? Math.round(fontSize * 0.3) : position === "bottom" ? natH - Math.round(fontSize * 0.3) : Math.round(natH / 2);
			const lines = text.split("\n");
			const lineHeight = fontSize * 1.1;
			const totalH = lines.length * lineHeight;
			const startY = position === "center" ? yPos - totalH / 2 + lineHeight / 2 : position === "bottom" ? yPos - (lines.length - 1) * lineHeight : yPos;
			ctx.lineJoin = "round";
			ctx.miterLimit = 2;
			lines.forEach((ln, i) => {
				const yy = startY + i * lineHeight;
				if (strokeWidth > 0) {
					ctx.strokeStyle = stroke;
					ctx.lineWidth = strokeWidth;
					ctx.strokeText(ln, natW / 2, yy);
				}
				ctx.fillStyle = color;
				ctx.fillText(ln, natW / 2, yy);
			});
			cnv.toBlob((blob) => {
				if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
				blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab))).catch(reject);
			}, "image/png");
		});
	}

	async function run() {
		if (!file || !loaded || !natW) return;
		busy = true; progress = 0; message = "Adding text…";
		try {
			const ff = await getFFmpeg();
			await ff.writeFile("input.gif", await fetchFile(file));
			const overlay = await renderTextOverlay();
			await ff.writeFile("text.png", overlay);
			const filter = "[0:v][1:v]overlay=0:0,split[a][b];[a]palettegen[p];[b][p]paletteuse";
			await ff.exec(["-i", "input.gif", "-i", "text.png", "-filter_complex", filter, "output.gif"]);
			const data = await ff.readFile("output.gif");
			const buf = (data as Uint8Array).buffer;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "image/gif" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Add Text to GIF</h1>
		<p class="text-muted-foreground mt-1">Caption a GIF with custom text, color, and stroke. Text is rendered with the browser's font engine.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="image/gif" label="Click or drag & drop a GIF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source ({natW}×{natH})</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={inputUrl} alt="source" class="w-full rounded-md" onload={onImgLoad} />
					<Button variant="outline" class="w-full" onclick={reset}>Change GIF</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Text</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5"><Label for="t">Text (multi-line)</Label><Textarea id="t" rows={3} bind:value={text} /></div>
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5">
							<Label>Position</Label>
							<Select.Root type="single" bind:value={position}>
								<Select.Trigger class="w-full">{position}</Select.Trigger>
								<Select.Content>
									<Select.Item value="top">Top</Select.Item>
									<Select.Item value="center">Center</Select.Item>
									<Select.Item value="bottom">Bottom</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div class="space-y-1.5"><Label for="fs">Font size</Label><Input id="fs" type="number" bind:value={fontSize} min="8" /></div>
						<div class="space-y-1.5"><Label for="fc">Color</Label><input id="fc" type="color" bind:value={color} class="h-9 w-full rounded border" /></div>
						<div class="space-y-1.5"><Label for="sc">Stroke</Label><input id="sc" type="color" bind:value={stroke} class="h-9 w-full rounded border" /></div>
						<div class="space-y-1.5"><Label for="sw">Stroke width</Label><Input id="sw" type="number" bind:value={strokeWidth} min="0" max="20" /></div>
						<div class="space-y-1.5"><Label for="ff">Font family</Label><Input id="ff" bind:value={fontFamily} /></div>
					</div>
					<Button class="w-full" onclick={run} disabled={!loaded || busy || !natW}>{busy ? "Working…" : "Add Text"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="captioned.gif"><Download />Download GIF</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
