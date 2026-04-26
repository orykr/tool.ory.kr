<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { onDestroy } from "svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Download from "@lucide/svelte/icons/download";
	import Trash2 from "@lucide/svelte/icons/trash-2";

	type Format = "image/png" | "image/jpeg" | "image/webp";
	const labels: Record<Format, string> = {
		"image/png": "PNG",
		"image/jpeg": "JPEG",
		"image/webp": "WebP"
	};

	let fileName = $state<string | null>(null);
	let originalUrl = $state<string | null>(null);
	let originalSize = $state(0);
	let imgW = $state(0);
	let imgH = $state(0);
	let format = $state<Format>("image/webp");
	let quality = $state([0.85]);
	let resizeMax = $state(0);
	let outputUrl = $state<string | null>(null);
	let outputSize = $state(0);
	let isDragging = $state(false);
	let working = $state(false);
	let token = 0;

	async function process(file: File | undefined) {
		if (!file) return;
		const myToken = ++token;
		clearOutput();
		fileName = file.name;
		originalSize = file.size;
		if (originalUrl) URL.revokeObjectURL(originalUrl);
		originalUrl = URL.createObjectURL(file);

		const img = new Image();
		img.src = originalUrl;
		await img.decode().catch(() => {});
		if (myToken !== token) return;
		imgW = img.naturalWidth;
		imgH = img.naturalHeight;
		await convert();
	}

	async function convert() {
		if (!originalUrl) return;
		const myToken = ++token;
		working = true;
		try {
			const img = new Image();
			img.src = originalUrl;
			await img.decode();
			if (myToken !== token) return;

			let w = img.naturalWidth;
			let h = img.naturalHeight;
			const max = Math.floor(resizeMax) || 0;
			if (max > 0 && Math.max(w, h) > max) {
				const scale = max / Math.max(w, h);
				w = Math.round(w * scale);
				h = Math.round(h * scale);
			}

			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.imageSmoothingQuality = "high";
			ctx.drawImage(img, 0, 0, w, h);

			const blob: Blob | null = await new Promise((resolve) =>
				canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality[0])
			);
			if (myToken !== token) return;
			if (!blob) return;
			if (outputUrl) URL.revokeObjectURL(outputUrl);
			outputUrl = URL.createObjectURL(blob);
			outputSize = blob.size;
		} finally {
			if (myToken === token) working = false;
		}
	}

	function clearOutput() {
		if (outputUrl) URL.revokeObjectURL(outputUrl);
		outputUrl = null;
		outputSize = 0;
	}

	function clearAll() {
		token++;
		if (originalUrl) URL.revokeObjectURL(originalUrl);
		clearOutput();
		originalUrl = null;
		fileName = null;
		originalSize = 0;
		imgW = 0;
		imgH = 0;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		process(target.files?.[0]);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		process(e.dataTransfer?.files[0]);
	}

	function download() {
		if (!outputUrl) return;
		const ext = format === "image/jpeg" ? "jpg" : format === "image/png" ? "png" : "webp";
		const base = fileName ? fileName.replace(/\.[^.]+$/, "") : "image";
		const a = document.createElement("a");
		a.href = outputUrl;
		a.download = `${base}.${ext}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	$effect(() => {
		void format;
		void quality;
		void resizeMax;
		if (originalUrl) convert();
	});

	onDestroy(() => {
		if (originalUrl) URL.revokeObjectURL(originalUrl);
		if (outputUrl) URL.revokeObjectURL(outputUrl);
	});

	function formatSize(b: number): string {
		if (b < 1024) return `${b} B`;
		if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
		return `${(b / 1024 / 1024).toFixed(2)} MB`;
	}

	let savings = $derived.by(() => {
		if (!originalSize || !outputSize) return null;
		const diff = originalSize - outputSize;
		return ((diff / originalSize) * 100).toFixed(1);
	});
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Image Format Converter</h1>
		<p class="text-muted-foreground mt-1">
			Convert PNG ↔ JPEG ↔ WebP via canvas, with quality and resize options.
		</p>
	</header>

	{#if !fileName}
		<button
			type="button"
			class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border'}"
			onclick={() => document.getElementById("if-file")?.click()}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<Upload class="h-10 w-10" />
			<p>Click or drop an image (PNG/JPEG/WebP/GIF/AVIF/etc.)</p>
			<input id="if-file" type="file" accept="image/*" onchange={handleFileSelect} class="hidden" />
		</button>
	{:else}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Original</Card.Title>
					<Button variant="ghost" size="sm" onclick={clearAll}>
						<Trash2 />
						Remove
					</Button>
				</Card.Header>
				<Card.Content class="space-y-2">
					{#if originalUrl}
						<img src={originalUrl} alt={fileName} class="bg-muted/50 max-h-72 w-full rounded-md border object-contain" />
					{/if}
					<dl class="text-muted-foreground grid grid-cols-2 gap-1 text-xs">
						<div><dt>File</dt><dd class="font-mono break-all">{fileName}</dd></div>
						<div><dt>Size</dt><dd class="font-mono">{formatSize(originalSize)}</dd></div>
						<div class="col-span-2"><dt>Dimensions</dt><dd class="font-mono">{imgW} × {imgH}</dd></div>
					</dl>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header><Card.Title class="text-base">Converted</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="space-y-1.5">
						<Label for="fm">Output format</Label>
						<Select.Root type="single" bind:value={format as never}>
							<Select.Trigger id="fm" class="w-full">{labels[format]}</Select.Trigger>
							<Select.Content>
								<Select.Item value="image/png">PNG</Select.Item>
								<Select.Item value="image/jpeg">JPEG</Select.Item>
								<Select.Item value="image/webp">WebP</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					{#if format !== "image/png"}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label>Quality</Label>
								<span class="text-muted-foreground font-mono text-xs">{Math.round(quality[0] * 100)}%</span>
							</div>
							<Slider type="multiple" bind:value={quality} min={0.1} max={1} step={0.05} />
						</div>
					{/if}

					<div class="space-y-1.5">
						<Label for="rs">Max dimension (px, 0 = keep)</Label>
						<Input id="rs" type="number" min="0" bind:value={resizeMax} class="font-mono" />
					</div>

					{#if outputUrl}
						<img src={outputUrl} alt="converted" class="bg-muted/50 max-h-72 w-full rounded-md border object-contain" />
						<dl class="text-muted-foreground grid grid-cols-2 gap-1 text-xs">
							<div><dt>Output size</dt><dd class="font-mono">{formatSize(outputSize)}</dd></div>
							{#if savings}
								<div><dt>Savings</dt><dd class="font-mono">{Number(savings) >= 0 ? "−" : "+"}{Math.abs(Number(savings))}%</dd></div>
							{/if}
						</dl>
						<Button class="w-full" onclick={download}>
							<Download />
							Download
						</Button>
					{:else if working}
						<p class="text-muted-foreground text-sm">Converting...</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</main>
