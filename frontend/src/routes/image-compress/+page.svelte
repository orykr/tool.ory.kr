<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let file = $state<File | null>(null);
	let url = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let outBlob = $state<Blob | null>(null);
	let outFormat = $state<"jpeg" | "webp" | "png">("jpeg");
	let quality = $state([75]);
	let inputSize = $state(0);
	let outputSize = $state(0);

	function setFile(f: File) {
		if (url) URL.revokeObjectURL(url);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; url = URL.createObjectURL(f);
		inputSize = f.size;
		outUrl = null; outBlob = null;
	}

	async function compress() {
		if (!file) return;
		const img = await new Promise<HTMLImageElement>((res, rej) => {
			const i = new Image();
			i.onload = () => res(i);
			i.onerror = () => rej(new Error("Image load failed"));
			i.src = url!;
		});
		const cnv = document.createElement("canvas");
		cnv.width = img.naturalWidth; cnv.height = img.naturalHeight;
		const ctx = cnv.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(img, 0, 0);
		const mime = outFormat === "jpeg" ? "image/jpeg" : outFormat === "webp" ? "image/webp" : "image/png";
		const q = quality[0] / 100;
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, mime, q));
		if (!blob) return;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = URL.createObjectURL(blob);
		outBlob = blob;
		outputSize = blob.size;
	}

	function fmt(n: number) {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / 1024 / 1024).toFixed(2)} MB`;
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Image Compressor</h1>
		<p class="text-muted-foreground mt-1">Compress JPG / PNG / WebP images by re-encoding with a chosen quality.</p>
	</header>

	{#if !file}
		<FileDrop accept="image/*" label="Click or drag & drop an image here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source ({fmt(inputSize)})</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={url} alt="source" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { file = null; if (url) URL.revokeObjectURL(url); url = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; outBlob = null; }}>Change</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label>Format</Label>
						<Select.Root type="single" bind:value={outFormat}>
							<Select.Trigger class="w-full">{outFormat.toUpperCase()}</Select.Trigger>
							<Select.Content>
								<Select.Item value="jpeg">JPEG</Select.Item>
								<Select.Item value="webp">WebP</Select.Item>
								<Select.Item value="png">PNG (lossless)</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					{#if outFormat !== "png"}
						<div class="space-y-2">
							<div class="flex items-center justify-between"><Label>Quality</Label><span class="text-muted-foreground text-sm">{quality[0]}</span></div>
							<Slider type="multiple" bind:value={quality} min={1} max={100} step={1} />
						</div>
					{/if}
					<Button class="w-full" onclick={compress}>Compress</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl && outBlob}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title class="text-base">
					Output ({fmt(outputSize)} — {(outputSize / inputSize * 100).toFixed(1)}% of original)
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download={`compressed.${outFormat === "jpeg" ? "jpg" : outFormat}`}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
