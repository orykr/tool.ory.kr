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
	let inputUrl = $state<string | null>(null);
	let img = $state<HTMLImageElement | null>(null);
	let outUrl = $state<string | null>(null);
	let outFormat = $state<"png" | "jpg" | "webp">("png");

	let brightness = $state([100]);
	let contrast = $state([100]);
	let saturation = $state([100]);
	let blur = $state([0]);
	let grayscale = $state([0]);
	let sepia = $state([0]);
	let invert = $state(false);
	let hueRotate = $state([0]);

	let cssFilter = $derived(
		`brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%) blur(${blur[0]}px) grayscale(${grayscale[0]}%) sepia(${sepia[0]}%) hue-rotate(${hueRotate[0]}deg) ${invert ? "invert(100%)" : ""}`
	);

	function setFile(f: File) {
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; inputUrl = URL.createObjectURL(f); outUrl = null;
		const i = new Image();
		i.onload = () => { img = i; };
		i.src = inputUrl;
	}

	async function render() {
		if (!img) return;
		const cnv = document.createElement("canvas");
		cnv.width = img.naturalWidth; cnv.height = img.naturalHeight;
		const ctx = cnv.getContext("2d");
		if (!ctx) return;
		(ctx as any).filter = cssFilter;
		ctx.drawImage(img, 0, 0);
		const mime = outFormat === "png" ? "image/png" : outFormat === "jpg" ? "image/jpeg" : "image/webp";
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, mime, 0.92));
		if (!blob) return;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = URL.createObjectURL(blob);
	}

	function reset() {
		brightness = [100]; contrast = [100]; saturation = [100];
		blur = [0]; grayscale = [0]; sepia = [0];
		invert = false; hueRotate = [0];
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Image Effects</h1>
		<p class="text-muted-foreground mt-1">Apply brightness, contrast, saturation, blur, sepia, grayscale, hue-rotate, and invert filters via Canvas2D.</p>
	</header>

	{#if !file}
		<FileDrop accept="image/*" label="Click or drag & drop an image here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Preview</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="bg-muted overflow-hidden rounded-md">
						{#if inputUrl}<img src={inputUrl} alt="preview" class="w-full" style="filter:{cssFilter}" />{/if}
					</div>
					<Button variant="outline" class="w-full" onclick={() => { file = null; if (inputUrl) URL.revokeObjectURL(inputUrl); inputUrl = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; img = null; }}>Change Image</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Filters</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Brightness</Label><span class="text-muted-foreground text-sm">{brightness[0]}%</span></div><Slider type="multiple" bind:value={brightness} min={0} max={300} step={1} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Contrast</Label><span class="text-muted-foreground text-sm">{contrast[0]}%</span></div><Slider type="multiple" bind:value={contrast} min={0} max={300} step={1} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Saturation</Label><span class="text-muted-foreground text-sm">{saturation[0]}%</span></div><Slider type="multiple" bind:value={saturation} min={0} max={300} step={1} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Blur</Label><span class="text-muted-foreground text-sm">{blur[0]}px</span></div><Slider type="multiple" bind:value={blur} min={0} max={20} step={0.5} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Grayscale</Label><span class="text-muted-foreground text-sm">{grayscale[0]}%</span></div><Slider type="multiple" bind:value={grayscale} min={0} max={100} step={1} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Sepia</Label><span class="text-muted-foreground text-sm">{sepia[0]}%</span></div><Slider type="multiple" bind:value={sepia} min={0} max={100} step={1} /></div>
					<div class="space-y-2"><div class="flex items-center justify-between"><Label>Hue rotate</Label><span class="text-muted-foreground text-sm">{hueRotate[0]}°</span></div><Slider type="multiple" bind:value={hueRotate} min={-180} max={180} step={1} /></div>
					<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={invert} /> Invert colors</label>
					<div class="space-y-1.5">
						<Label>Output</Label>
						<Select.Root type="single" bind:value={outFormat}>
							<Select.Trigger class="w-full">{outFormat.toUpperCase()}</Select.Trigger>
							<Select.Content>
								<Select.Item value="png">PNG</Select.Item>
								<Select.Item value="jpg">JPG</Select.Item>
								<Select.Item value="webp">WebP</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<Button variant="outline" onclick={reset}>Reset</Button>
						<Button onclick={render}>Render</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Output</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download={`effect.${outFormat}`}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
