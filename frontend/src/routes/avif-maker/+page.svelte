<script lang="ts">
	import { onMount } from "svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let supported = $state(false);
	let file = $state<File | null>(null);
	let url = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let outBlob = $state<Blob | null>(null);
	let img = $state<HTMLImageElement | null>(null);
	let quality = $state([75]);
	let inputSize = $state(0);
	let outputSize = $state(0);
	let message = $state("Checking AVIF encoder support…");

	onMount(async () => {
		const cnv = document.createElement("canvas");
		cnv.width = 1; cnv.height = 1;
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/avif", 0.5));
		if (blob && blob.type === "image/avif") {
			supported = true;
			message = "Drop an image to encode as AVIF.";
		} else {
			message = "Your browser cannot encode AVIF natively. Use Chrome 85+ or Firefox 113+.";
		}
	});

	function setFile(f: File) {
		if (url) URL.revokeObjectURL(url);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; url = URL.createObjectURL(f); outUrl = null; outBlob = null;
		inputSize = f.size;
		const i = new Image();
		i.onload = () => { img = i; };
		i.src = url;
	}

	async function encode() {
		if (!img) return;
		const cnv = document.createElement("canvas");
		cnv.width = img.naturalWidth; cnv.height = img.naturalHeight;
		const ctx = cnv.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(img, 0, 0);
		const q = quality[0] / 100;
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/avif", q));
		if (!blob || blob.type !== "image/avif") {
			message = "Encoding failed. Browser fell back to a different format.";
			return;
		}
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = URL.createObjectURL(blob);
		outBlob = blob;
		outputSize = blob.size;
		message = "Done.";
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
		<h1 class="text-3xl font-bold tracking-tight">AVIF Maker</h1>
		<p class="text-muted-foreground mt-1">Encode any still image to AVIF using your browser's native encoder. AVIF often produces 20–50% smaller files than WebP at the same quality. Animated AVIF is not supported in this tool.</p>
	</header>
	<div class="mb-6 rounded-md border bg-muted text-muted-foreground p-4 text-center text-sm">{message}</div>

	{#if supported}
		{#if !file}
			<FileDrop accept="image/*" label="Click or drag & drop an image here" onfiles={(f) => setFile(f[0])} />
		{:else}
			<div class="grid gap-6 md:grid-cols-2">
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Source ({fmt(inputSize)})</Card.Title></Card.Header>
					<Card.Content class="space-y-3">
						<img src={url} alt="src" class="w-full rounded-md" />
						<Button variant="outline" class="w-full" onclick={() => { file = null; if (url) URL.revokeObjectURL(url); url = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; outBlob = null; img = null; }}>Change</Button>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header><Card.Title class="text-base">Encode</Card.Title></Card.Header>
					<Card.Content class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center justify-between"><Label>Quality</Label><span class="text-muted-foreground text-sm">{quality[0]}</span></div>
							<Slider type="single" bind:value={quality} min={1} max={100} step={1} />
						</div>
						<Button class="w-full" onclick={encode}>Encode AVIF</Button>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	{/if}

	{#if outUrl && outBlob}
		<Card.Root class="mt-6">
			<Card.Header>
				<Card.Title class="text-base">Output ({fmt(outputSize)} — {(outputSize / inputSize * 100).toFixed(1)}% of original)</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="image.avif"><Download />Download AVIF</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
