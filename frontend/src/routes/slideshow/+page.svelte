<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
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
	let displayDur = $state(2);
	let crossfade = $state(0.5);
	let target = $state<"mp4" | "gif">("mp4");
	let outW = $state(960);
	let outH = $state(540);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Encoding… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
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

	async function fileToPng(f: File): Promise<Uint8Array> {
		const url = URL.createObjectURL(f);
		try {
			const img = await new Promise<HTMLImageElement>((res, rej) => {
				const i = new Image();
				i.onload = () => res(i);
				i.onerror = () => rej(new Error("Image load failed"));
				i.src = url;
			});
			const cnv = document.createElement("canvas");
			const w = Math.max(2, outW & ~1), h = Math.max(2, outH & ~1);
			cnv.width = w; cnv.height = h;
			const ctx = cnv.getContext("2d");
			if (!ctx) throw new Error("No 2d context");
			ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
			const ar = img.naturalWidth / img.naturalHeight;
			const targetAr = w / h;
			let dw, dh;
			if (ar > targetAr) { dw = w; dh = Math.round(w / ar); } else { dh = h; dw = Math.round(h * ar); }
			ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
			const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/png"));
			if (!blob) throw new Error("toBlob failed");
			return new Uint8Array(await blob.arrayBuffer());
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	async function run() {
		if (!loaded || frames.length < 1) return;
		busy = true; progress = 0; message = "Preparing frames…";
		try {
			const ff = await getFFmpeg();
			for (let i = 0; i < frames.length; i++) {
				const data = await fileToPng(frames[i].file);
				await ff.writeFile(`s_${i.toString().padStart(4, "0")}.png`, data);
			}
			const dd = Math.max(0.2, Number(displayDur) || 2);
			const cf = Math.max(0, Math.min(dd - 0.05, Number(crossfade) || 0));
			let outName: string;
			let args: string[];
			if (frames.length === 1 || cf === 0) {
				outName = target === "gif" ? "output.gif" : "output.mp4";
				const concatArgs: string[] = [];
				for (let i = 0; i < frames.length; i++) {
					concatArgs.push("-loop", "1", "-t", dd.toFixed(3), "-i", `s_${i.toString().padStart(4, "0")}.png`);
				}
				const filterParts: string[] = [];
				for (let i = 0; i < frames.length; i++) filterParts.push(`[${i}:v]`);
				const concat = `${filterParts.join("")}concat=n=${frames.length}:v=1:a=0[v]`;
				if (target === "gif") {
					args = [...concatArgs, "-filter_complex", `${concat};[v]split[a][b];[a]palettegen[p];[b][p]paletteuse[out]`, "-map", "[out]", outName];
				} else {
					args = [...concatArgs, "-filter_complex", concat, "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", outName];
				}
			} else {
				outName = target === "gif" ? "output.gif" : "output.mp4";
				const concatArgs: string[] = [];
				for (let i = 0; i < frames.length; i++) {
					concatArgs.push("-loop", "1", "-t", dd.toFixed(3), "-i", `s_${i.toString().padStart(4, "0")}.png`);
				}
				let last = "[0:v]";
				const parts: string[] = [];
				let curOffset = dd - cf;
				for (let i = 1; i < frames.length; i++) {
					const tag = i === frames.length - 1 ? "[v]" : `[x${i}]`;
					parts.push(`${last}[${i}:v]xfade=transition=fade:duration=${cf.toFixed(3)}:offset=${curOffset.toFixed(3)}${tag}`);
					last = tag;
					curOffset += dd - cf;
				}
				let xf = parts.join(";");
				if (frames.length === 1) xf = "[0:v]copy[v]";
				if (target === "gif") {
					args = [...concatArgs, "-filter_complex", `${xf};[v]split[a][b];[a]palettegen[p];[b][p]paletteuse[out]`, "-map", "[out]", outName];
				} else {
					args = [...concatArgs, "-filter_complex", xf, "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", outName];
				}
			}
			message = "Encoding…";
			await ff.exec(args);
			const data = await ff.readFile(outName) as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: target === "gif" ? "image/gif" : "video/mp4" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Slideshow Maker</h1>
		<p class="text-muted-foreground mt-1">Combine images into a slideshow video or GIF, with crossfade transitions and a fixed canvas size.</p>
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
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="dd">Per-image duration (sec)</Label><Input id="dd" type="number" bind:value={displayDur} min="0.2" step="0.1" /></div>
					<div class="space-y-1.5"><Label for="cf">Crossfade (sec)</Label><Input id="cf" type="number" bind:value={crossfade} min="0" step="0.1" /></div>
					<div class="space-y-1.5"><Label for="ow">Width (px)</Label><Input id="ow" type="number" bind:value={outW} min="64" /></div>
					<div class="space-y-1.5"><Label for="oh">Height (px)</Label><Input id="oh" type="number" bind:value={outH} min="64" /></div>
				</div>
				<div class="space-y-1.5">
					<Label>Output</Label>
					<Select.Root type="single" bind:value={target}>
						<Select.Trigger class="w-full">{target === "mp4" ? "MP4 video" : "GIF"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="mp4">MP4 video (H.264)</Select.Item>
							<Select.Item value="gif">Animated GIF</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy || frames.length < 1}>{busy ? "Working…" : "Build slideshow"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				{#if target === "gif"}
					<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				{:else}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				{/if}
				<Button href={outUrl} download={target === "gif" ? "slideshow.gif" : "slideshow.mp4"}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
