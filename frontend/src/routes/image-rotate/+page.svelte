<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let file = $state<File | null>(null);
	let url = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let img = $state<HTMLImageElement | null>(null);
	let angle = $state([0]);
	let bg = $state("#ffffff");
	let transparent = $state(false);
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
		const rad = (angle[0] * Math.PI) / 180;
		const w = img.naturalWidth, h = img.naturalHeight;
		const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
		const W = Math.ceil(w * cos + h * sin);
		const H = Math.ceil(w * sin + h * cos);
		const cnv = document.createElement("canvas");
		cnv.width = W; cnv.height = H;
		const ctx = cnv.getContext("2d");
		if (!ctx) return;
		if (!transparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
		ctx.translate(W / 2, H / 2);
		ctx.rotate(rad);
		ctx.drawImage(img, -w / 2, -h / 2);
		const mime = outFormat === "png" ? "image/png" : outFormat === "jpeg" ? "image/jpeg" : "image/webp";
		const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, mime, 0.92));
		if (!blob) return;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = URL.createObjectURL(blob);
	}

	function snap(deg: number) { angle = [deg]; }
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Rotate Image</h1>
		<p class="text-muted-foreground mt-1">Rotate a static image at any angle. Canvas resizes to fit; choose a background or keep transparency.</p>
	</header>

	{#if !file}
		<FileDrop accept="image/*" label="Click or drag & drop an image here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Preview</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="bg-muted overflow-hidden rounded-md p-4 flex items-center justify-center">
						{#if url}<img src={url} alt="preview" style="transform:rotate({angle[0]}deg);max-height:60vh" />{/if}
					</div>
					<Button variant="outline" class="w-full" onclick={() => { file = null; if (url) URL.revokeObjectURL(url); url = null; if (outUrl) URL.revokeObjectURL(outUrl); outUrl = null; img = null; }}>Change image</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Rotation</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<div class="flex items-center justify-between"><Label>Angle</Label><span class="text-muted-foreground text-sm">{angle[0]}°</span></div>
						<Slider type="single" bind:value={angle} min={-180} max={180} step={1} />
						<Input type="number" bind:value={angle[0]} min={-360} max={360} />
					</div>
					<div class="flex flex-wrap gap-2">
						{#each [-90, -45, 0, 45, 90, 180] as v}
							<Button variant="outline" size="sm" onclick={() => snap(v)}>{v}°</Button>
						{/each}
					</div>
					<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={transparent} disabled={outFormat === "jpeg"} /> Transparent background (PNG/WebP only)</label>
					{#if !transparent || outFormat === "jpeg"}
						<div class="space-y-1.5"><Label for="bg">Background</Label><input id="bg" type="color" bind:value={bg} class="h-9 w-full rounded border" /></div>
					{/if}
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
				<Button href={outUrl} download={`rotated.${outFormat === "jpeg" ? "jpg" : outFormat}`}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
