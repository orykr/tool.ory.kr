<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";
	import FlipHorizontal from "@lucide/svelte/icons/flip-horizontal";
	import FlipVertical from "@lucide/svelte/icons/flip-vertical";

	let file = $state<File | null>(null);
	let url = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let img = $state<HTMLImageElement | null>(null);
	let direction = $state<"h" | "v" | "both">("h");
	let outFormat = $state<"png" | "jpeg" | "webp">("png");

	function setFile(f: File) {
		if (url) URL.revokeObjectURL(url);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; url = URL.createObjectURL(f); outUrl = null;
		const i = new Image();
		i.onload = () => { img = i; };
		i.src = url;
	}

	async function render() {
		if (!img) return;
		const cnv = document.createElement("canvas");
		cnv.width = img.naturalWidth; cnv.height = img.naturalHeight;
		const ctx = cnv.getContext("2d");
		if (!ctx) return;
		const sx = direction === "h" || direction === "both" ? -1 : 1;
		const sy = direction === "v" || direction === "both" ? -1 : 1;
		ctx.translate(sx === -1 ? cnv.width : 0, sy === -1 ? cnv.height : 0);
		ctx.scale(sx, sy);
		ctx.drawImage(img, 0, 0);
		const mime = outFormat === "png" ? "image/png" : outFormat === "jpeg" ? "image/jpeg" : "image/webp";
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, mime, 0.92));
		if (!blob) return;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = URL.createObjectURL(blob);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Flip Image</h1>
		<p class="text-muted-foreground mt-1">Flip a static image horizontally, vertically, or both.</p>
	</header>

	{#if !file}
		<FileDrop accept="image/*" label="Click or drag & drop an image here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={url} alt="src" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { file = null; if (url) URL.revokeObjectURL(url); url = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; img = null; }}>Change image</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Direction</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-3 gap-2">
						<Button variant={direction === "h" ? "default" : "outline"} onclick={() => direction = "h"}><FlipHorizontal />Horizontal</Button>
						<Button variant={direction === "v" ? "default" : "outline"} onclick={() => direction = "v"}><FlipVertical />Vertical</Button>
						<Button variant={direction === "both" ? "default" : "outline"} onclick={() => direction = "both"}>Both</Button>
					</div>
					<div class="space-y-1.5">
						<Label>Format</Label>
						<Select.Root type="single" bind:value={outFormat}>
							<Select.Trigger class="w-full">{outFormat.toUpperCase()}</Select.Trigger>
							<Select.Content>
								<Select.Item value="png">PNG</Select.Item>
								<Select.Item value="jpeg">JPEG</Select.Item>
								<Select.Item value="webp">WebP</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<Button class="w-full" onclick={render}>Render</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download={`flipped.${outFormat === "jpeg" ? "jpg" : outFormat}`}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
