<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let brightness = $state([0]);
	let contrast = $state([1]);
	let saturation = $state([1]);
	let hue = $state([0]);
	let grayscale = $state(false);
	let sepia = $state(false);
	let invert = $state(false);

	function build(input: string, output: string) {
		const ops: string[] = [];
		ops.push(`eq=brightness=${brightness[0].toFixed(2)}:contrast=${contrast[0].toFixed(2)}:saturation=${saturation[0].toFixed(2)}`);
		if (hue[0] !== 0) ops.push(`hue=h=${hue[0]}`);
		if (grayscale) ops.push("hue=s=0");
		if (sepia) ops.push("colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131");
		if (invert) ops.push("negate");
		const filter = `${ops.join(",")},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
		return ["-i", input, "-filter_complex", filter, output];
	}
</script>

<GifTool title="GIF Effects" description="Apply brightness, contrast, saturation, hue, grayscale, sepia, and invert filters to a GIF." downloadName="effects.gif" actionLabel="Apply" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Brightness</Label><span class="text-muted-foreground text-sm">{brightness[0].toFixed(2)}</span></div>
			<Slider type="single" bind:value={brightness} min={-1} max={1} step={0.05} />
		</div>
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Contrast</Label><span class="text-muted-foreground text-sm">{contrast[0].toFixed(2)}</span></div>
			<Slider type="single" bind:value={contrast} min={0} max={3} step={0.05} />
		</div>
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Saturation</Label><span class="text-muted-foreground text-sm">{saturation[0].toFixed(2)}</span></div>
			<Slider type="single" bind:value={saturation} min={0} max={3} step={0.05} />
		</div>
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Hue rotation (deg)</Label><span class="text-muted-foreground text-sm">{hue[0]}</span></div>
			<Slider type="single" bind:value={hue} min={-180} max={180} step={1} />
		</div>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={grayscale} /> Grayscale</label>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={sepia} /> Sepia</label>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={invert} /> Invert colors</label>
	{/snippet}
</GifTool>
