<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	const PDFJS_VERSION = "4.8.69";
	const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

	let ffmpegLoaded = $state(false);
	let pdfjsLoaded = $state(false);
	let message = $state("Loading FFmpeg & pdf.js…");
	let progress = $state(0);
	let busy = $state(false);
	let file = $state<File | null>(null);
	let outUrl = $state<string | null>(null);

	let firstPage = $state(1);
	let lastPage = $state<number | "">("");
	let scale = $state(2);
	let delayMs = $state(1000);
	let target = $state<"gif" | "mp4">("gif");
	let pageCount = $state(0);
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;
	let pdfjs: any = null;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Encoding… ${p}%`; });
		(async () => {
			try { await getFFmpeg(); ffmpegLoaded = true; } catch { message = "Failed to load FFmpeg."; return; }
			try {
				pdfjs = await import(/* @vite-ignore */ `${PDFJS_BASE}/pdf.min.mjs`);
				pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
				pdfjsLoaded = true;
				message = "Ready.";
			} catch (e) {
				console.error(e);
				message = "Failed to load pdf.js from CDN.";
			}
		})();
		return off;
	});

	async function setFile(f: File) {
		file = f;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = null;
		pageCount = 0;
		if (!pdfjs) return;
		try {
			const ab = await f.arrayBuffer();
			const doc = await pdfjs.getDocument({ data: ab }).promise;
			pageCount = doc.numPages;
			doc.destroy?.();
			lastPage = pageCount;
			message = `Loaded ${pageCount} page${pageCount === 1 ? "" : "s"}.`;
		} catch (e) {
			console.error(e);
			message = "Failed to read PDF.";
		}
	}

	async function renderPage(pdf: any, n: number, sc: number): Promise<Uint8Array> {
		const page = await pdf.getPage(n);
		const viewport = page.getViewport({ scale: sc });
		const cnv = document.createElement("canvas");
		cnv.width = Math.max(2, Math.ceil(viewport.width) & ~1);
		cnv.height = Math.max(2, Math.ceil(viewport.height) & ~1);
		const ctx = cnv.getContext("2d");
		if (!ctx) throw new Error("no ctx");
		ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cnv.width, cnv.height);
		await page.render({ canvasContext: ctx, viewport }).promise;
		const blob: Blob | null = await new Promise((r) => cnv.toBlob(r, "image/png"));
		if (!blob) throw new Error("blob");
		return new Uint8Array(await blob.arrayBuffer());
	}

	async function run() {
		if (!file || !ffmpegLoaded || !pdfjsLoaded) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Rendering pages…";
		try {
			const ff = await getFFmpeg();
			const ab = await file.arrayBuffer();
			const pdf = await pdfjs.getDocument({ data: ab }).promise;
			const start = Math.max(1, Math.min(pdf.numPages, Number(firstPage) || 1));
			const end = Math.max(start, Math.min(pdf.numPages, lastPage === "" ? pdf.numPages : Number(lastPage)));
			for (let i = start; i <= end; i++) {
				if (seq !== runSeq) { pdf.destroy?.(); return; }
				message = `Rendering page ${i}/${end}…`;
				const data = await renderPage(pdf, i, Math.max(1, Math.min(4, scale)));
				const idx = i - start;
				await ff.writeFile(`p_${idx.toString().padStart(4, "0")}.png`, data);
			}
			pdf.destroy?.();
			const fps = Math.max(0.1, 1000 / Math.max(50, Number(delayMs) || 1000));
			let outName: string;
			let args: string[];
			if (target === "gif") {
				outName = "output.gif";
				args = [
					"-framerate", fps.toFixed(3),
					"-i", "p_%04d.png",
					"-filter_complex", "split[a][b];[a]palettegen[p];[b][p]paletteuse",
					outName
				];
			} else {
				outName = "output.mp4";
				args = [
					"-framerate", fps.toFixed(3),
					"-i", "p_%04d.png",
					"-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
					"-c:v", "libx264", "-preset", "medium", "-crf", "23",
					"-pix_fmt", "yuv420p",
					outName
				];
			}
			message = "Encoding…";
			await ff.exec(args);
			if (seq !== runSeq) return;
			const data = await ff.readFile(outName) as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: target === "gif" ? "image/gif" : "video/mp4" }));
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
		<h1 class="text-3xl font-bold tracking-tight">PDF to GIF / MP4</h1>
		<p class="text-muted-foreground mt-1">Render PDF pages to a slideshow GIF or MP4. PDF.js is loaded from a CDN at runtime.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="application/pdf" label="Click or drag & drop a PDF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Settings ({pageCount} pages)</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="fp">First page</Label><Input id="fp" type="number" bind:value={firstPage} min="1" max={pageCount} /></div>
					<div class="space-y-1.5"><Label for="lp">Last page</Label><Input id="lp" type="number" bind:value={lastPage} min={firstPage} max={pageCount} /></div>
					<div class="space-y-1.5"><Label for="sc">Scale</Label><Input id="sc" type="number" bind:value={scale} min="1" max="4" step="0.5" /></div>
					<div class="space-y-1.5"><Label for="dd">Delay per page (ms)</Label><Input id="dd" type="number" bind:value={delayMs} min="50" /></div>
				</div>
				<div class="space-y-1.5">
					<Label>Output</Label>
					<select bind:value={target} class="border-input bg-background h-9 w-full rounded border px-3 text-sm">
						<option value="gif">GIF</option>
						<option value="mp4">MP4 (H.264)</option>
					</select>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" onclick={() => { file = null; pageCount = 0; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; }}>Change PDF</Button>
					<Button class="flex-1" onclick={run} disabled={!ffmpegLoaded || !pdfjsLoaded || busy}>{busy ? "Working…" : "Build"}</Button>
				</div>
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
				<Button href={outUrl} download={target === "gif" ? "pdf.gif" : "pdf.mp4"}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
