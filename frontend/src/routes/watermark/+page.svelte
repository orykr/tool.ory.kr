<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
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
	let outUrl = $state<string | null>(null);
	let outName = $state("watermarked");

	let mode = $state<"text" | "image">("text");
	let text = $state("© Your Brand");
	let logoFile = $state<File | null>(null);
	let logoUrl = $state<string | null>(null);
	let position = $state<"tl" | "tr" | "bl" | "br" | "center">("br");
	let margin = $state(20);
	let scalePct = $state(15);
	let opacity = $state([0.6]);
	let fontSize = $state(36);
	let fontColor = $state("#ffffff");
	let strokeColor = $state("#000000");
	let strokeWidth = $state(2);
	let fontFamily = $state("Arial, sans-serif");
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Watermarking… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function setBase(f: File) { if (baseUrl) URL.revokeObjectURL(baseUrl); baseFile = f; baseUrl = URL.createObjectURL(f); }
	function setLogo(f: File) { if (logoUrl) URL.revokeObjectURL(logoUrl); logoFile = f; logoUrl = URL.createObjectURL(f); }

	async function getDims(): Promise<{ w: number; h: number; isVideo: boolean }> {
		if (!baseFile) throw new Error("no file");
		const isVideo = baseFile.type.startsWith("video/");
		if (isVideo) {
			const v = document.createElement("video");
			v.src = baseUrl!;
			await new Promise<void>((res) => { v.onloadedmetadata = () => res(); });
			return { w: v.videoWidth, h: v.videoHeight, isVideo };
		}
		const i = new Image();
		i.src = baseUrl!;
		await new Promise<void>((res, rej) => { i.onload = () => res(); i.onerror = () => rej(new Error("img load")); });
		return { w: i.naturalWidth, h: i.naturalHeight, isVideo };
	}

	async function renderTextPng(W: number, H: number): Promise<Uint8Array> {
		const cnv = document.createElement("canvas");
		cnv.width = W; cnv.height = H;
		const ctx = cnv.getContext("2d");
		if (!ctx) throw new Error("no ctx");
		ctx.font = `bold ${fontSize}px ${fontFamily}`;
		ctx.textBaseline = "top";
		const metrics = ctx.measureText(text);
		const tw = Math.ceil(metrics.width + strokeWidth * 4);
		const th = Math.ceil(fontSize * 1.5);
		const tcnv = document.createElement("canvas");
		tcnv.width = tw; tcnv.height = th;
		const tctx = tcnv.getContext("2d");
		if (!tctx) throw new Error("no ctx");
		tctx.font = `bold ${fontSize}px ${fontFamily}`;
		tctx.textBaseline = "top";
		if (strokeWidth > 0) { tctx.strokeStyle = strokeColor; tctx.lineWidth = strokeWidth; tctx.strokeText(text, strokeWidth * 2, fontSize * 0.2); }
		tctx.fillStyle = fontColor;
		tctx.fillText(text, strokeWidth * 2, fontSize * 0.2);
		const blob: Blob | null = await new Promise((r) => tcnv.toBlob(r, "image/png"));
		if (!blob) throw new Error("blob");
		return new Uint8Array(await blob.arrayBuffer());
	}

	async function run() {
		if (!baseFile || !loaded) return;
		if (mode === "image" && !logoFile) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Watermarking…";
		try {
			const ff = await getFFmpeg();
			const { w, h, isVideo } = await getDims();
			const baseExt = baseFile.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "png");
			await ff.writeFile(`base.${baseExt}`, await fetchFile(baseFile));
			let outputName: string, outputType: string;
			const isGif = baseFile.type === "image/gif" || baseFile.name.toLowerCase().endsWith(".gif");
			if (isVideo) { outputName = "output.mp4"; outputType = "video/mp4"; outName = "watermarked.mp4"; }
			else if (isGif) { outputName = "output.gif"; outputType = "image/gif"; outName = "watermarked.gif"; }
			else { outputName = "output.png"; outputType = "image/png"; outName = "watermarked.png"; }

			let wmIn: string;
			if (mode === "text") {
				const png = await renderTextPng(w, h);
				await ff.writeFile("wm.png", png);
				wmIn = "wm.png";
			} else if (logoFile) {
				const lext = logoFile.name.split(".").pop()?.toLowerCase() || "png";
				await ff.writeFile(`logo.${lext}`, await fetchFile(logoFile));
				wmIn = `logo.${lext}`;
			} else { busy = false; return; }

			const a = Math.max(0, Math.min(1, opacity[0]));
			const m = Math.max(0, Math.min(500, Number(margin) || 0));
			let pos: string;
			if (position === "tl") pos = `${m}:${m}`;
			else if (position === "tr") pos = `main_w-overlay_w-${m}:${m}`;
			else if (position === "bl") pos = `${m}:main_h-overlay_h-${m}`;
			else if (position === "center") pos = "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
			else pos = `main_w-overlay_w-${m}:main_h-overlay_h-${m}`;

			let scaleNode = "";
			if (mode === "image") {
				const sf = Math.max(1, Math.min(100, scalePct)) / 100;
				scaleNode = `scale=iw*${sf}:-1,`;
			}

			const filter = `[1:v]${scaleNode}format=rgba,colorchannelmixer=aa=${a}[wm];[0:v][wm]overlay=${pos}`;

			const args: string[] = ["-i", `base.${baseExt}`, "-i", wmIn];
			if (isVideo) {
				args.push(
					"-filter_complex", filter,
					"-c:v", "libx264", "-preset", "medium", "-crf", "23",
					"-c:a", "copy",
					"-pix_fmt", "yuv420p",
					outputName
				);
			} else if (outputType === "image/gif") {
				args.push("-filter_complex", `${filter},split[a][b];[a]palettegen[p];[b][p]paletteuse`, outputName);
			} else {
				args.push("-filter_complex", filter, "-frames:v", "1", outputName);
			}

			await ff.exec(args);
			if (seq !== runSeq) return;
			const data = await ff.readFile(outputName) as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: outputType }));
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
		<h1 class="text-3xl font-bold tracking-tight">Watermark</h1>
		<p class="text-muted-foreground mt-1">Add a text or logo watermark to an image, GIF, or video.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			{#if baseUrl}
				{#if baseFile?.type.startsWith("video/")}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={baseUrl} controls class="w-full rounded-md"></video>
				{:else}
					<img src={baseUrl} alt="src" class="w-full rounded-md" />
				{/if}
				<Button variant="outline" class="w-full" onclick={() => { baseFile = null; if (baseUrl) URL.revokeObjectURL(baseUrl); baseUrl = null; }}>Change</Button>
			{:else}
				<FileDrop accept="image/*,video/*" label="Drop an image, GIF, or video" onfiles={(f) => setBase(f[0])} />
			{/if}
		</Card.Content>
	</Card.Root>

	{#if baseFile}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Watermark</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-1.5">
					<Label>Type</Label>
					<Select.Root type="single" bind:value={mode}>
						<Select.Trigger class="w-full">{mode === "text" ? "Text" : "Image / Logo"}</Select.Trigger>
						<Select.Content>
							<Select.Item value="text">Text</Select.Item>
							<Select.Item value="image">Image / Logo</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				{#if mode === "text"}
					<div class="space-y-1.5"><Label for="t">Text</Label><Input id="t" bind:value={text} /></div>
					<div class="grid grid-cols-2 gap-3">
						<div class="space-y-1.5"><Label for="fs">Font size</Label><Input id="fs" type="number" bind:value={fontSize} min="8" /></div>
						<div class="space-y-1.5"><Label for="ff">Font family</Label><Input id="ff" bind:value={fontFamily} /></div>
						<div class="space-y-1.5"><Label for="fc">Color</Label><input id="fc" type="color" bind:value={fontColor} class="h-9 w-full rounded border" /></div>
						<div class="space-y-1.5"><Label for="sc">Stroke</Label><input id="sc" type="color" bind:value={strokeColor} class="h-9 w-full rounded border" /></div>
						<div class="space-y-1.5"><Label for="sw">Stroke width</Label><Input id="sw" type="number" bind:value={strokeWidth} min="0" max="20" /></div>
					</div>
				{:else}
					{#if logoUrl}
						<img src={logoUrl} alt="logo" class="bg-muted rounded-md p-2" style="max-height:100px" />
						<Button variant="outline" class="w-full" onclick={() => { logoFile = null; if (logoUrl) URL.revokeObjectURL(logoUrl); logoUrl = null; }}>Change logo</Button>
					{:else}
						<FileDrop accept="image/*" label="Drop the logo (PNG with transparency works best)" onfiles={(f) => setLogo(f[0])} />
					{/if}
					<div class="space-y-1.5"><Label for="sc2">Logo size (% of base width)</Label><Input id="sc2" type="number" bind:value={scalePct} min="1" max="100" /></div>
				{/if}
				<div class="space-y-1.5">
					<Label>Position</Label>
					<Select.Root type="single" bind:value={position}>
						<Select.Trigger class="w-full">{position}</Select.Trigger>
						<Select.Content>
							<Select.Item value="tl">Top-left</Select.Item>
							<Select.Item value="tr">Top-right</Select.Item>
							<Select.Item value="bl">Bottom-left</Select.Item>
							<Select.Item value="br">Bottom-right</Select.Item>
							<Select.Item value="center">Center</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5"><Label for="mg">Margin (px)</Label><Input id="mg" type="number" bind:value={margin} min="0" max="500" /></div>
				<div class="space-y-2">
					<div class="flex items-center justify-between"><Label>Opacity</Label><span class="text-muted-foreground text-sm">{(opacity[0] * 100).toFixed(0)}%</span></div>
					<Slider type="multiple" bind:value={opacity} min={0} max={1} step={0.05} />
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy || (mode === "image" && !logoFile)}>{busy ? "Working…" : "Apply"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				{#if outName.endsWith(".mp4")}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				{:else}
					<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				{/if}
				<Button href={outUrl} download={outName}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
