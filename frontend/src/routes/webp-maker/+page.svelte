<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
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
	let quality = $state([80]);
	let lossless = $state(false);
	let target = $state<"webp" | "apng">("webp");
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Encoding… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function add(files: File[]) {
		const imgs = files.filter((f) => f.type.startsWith("image/"));
		const next = imgs.map((f) => ({ url: URL.createObjectURL(f), file: f }));
		frames = [...frames, ...next];
	}
	function remove(i: number) {
		const f = frames[i];
		URL.revokeObjectURL(f.url);
		frames = frames.filter((_, j) => j !== i);
	}
	function move(i: number, j: number) {
		if (j < 0 || j >= frames.length) return;
		const a = [...frames];
		const [m] = a.splice(i, 1); a.splice(j, 0, m);
		frames = a;
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
			cnv.width = img.naturalWidth; cnv.height = img.naturalHeight;
			const ctx = cnv.getContext("2d");
			if (!ctx) throw new Error("No 2d context");
			ctx.drawImage(img, 0, 0);
			const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/png"));
			if (!blob) throw new Error("toBlob failed");
			return new Uint8Array(await blob.arrayBuffer());
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	async function run() {
		if (!loaded || !frames.length) return;
		busy = true; progress = 0; message = "Encoding…";
		try {
			const ff = await getFFmpeg();
			for (let i = 0; i < frames.length; i++) {
				const data = await fileToPng(frames[i].file);
				await ff.writeFile(`f_${i.toString().padStart(4, "0")}.png`, data);
			}
			const ext = "png";
			const fps = Math.max(0.1, 1000 / delayMs);
			let outName: string;
			let args: string[];
			if (target === "webp") {
				outName = "output.webp";
				args = [
					"-framerate", fps.toFixed(3),
					"-i", `f_%04d.${ext}`,
					"-vcodec", "libwebp",
					"-loop", "0",
					"-q:v", String(quality[0]),
					"-lossless", lossless ? "1" : "0",
					outName
				];
			} else {
				outName = "output.png";
				args = [
					"-framerate", fps.toFixed(3),
					"-i", `f_%04d.${ext}`,
					"-plays", "0",
					"-f", "apng",
					outName
				];
			}
			await ff.exec(args);
			const data = await ff.readFile(outName) as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: target === "webp" ? "image/webp" : "image/apng" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">{target === "webp" ? "Animated WebP Maker" : "APNG Maker"}</h1>
		<p class="text-muted-foreground mt-1">Build an animated {target === "webp" ? "WebP" : "APNG"} from a sequence of images.</p>
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
					<div class="space-y-1.5"><Label for="d">Frame delay (ms)</Label><Input id="d" type="number" bind:value={delayMs} min="20" /></div>
					<div class="space-y-1.5">
						<Label>Output</Label>
						<select bind:value={target} class="border-input bg-background h-9 w-full rounded border px-3 text-sm">
							<option value="webp">Animated WebP</option>
							<option value="apng">Animated PNG (APNG)</option>
						</select>
					</div>
				</div>
				{#if target === "webp"}
					<div class="space-y-2">
						<div class="flex items-center justify-between"><Label>Quality</Label><span class="text-muted-foreground text-sm">{quality[0]}</span></div>
						<Slider type="single" bind:value={quality} min={1} max={100} step={1} />
					</div>
					<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={lossless} /> Lossless</label>
				{/if}
				<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : "Encode"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download={target === "webp" ? "output.webp" : "output.png"}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
