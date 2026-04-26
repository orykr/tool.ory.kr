<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let colors = $state([128]);
	let dither = $state("sierra2_4a");

	function build(input: string, output: string) {
		const n = Math.max(2, Math.min(256, colors[0]));
		const filter = `split[a][b];[a]palettegen=max_colors=${n}:stats_mode=full[p];[b][p]paletteuse=dither=${dither}`;
		return ["-i", input, "-filter_complex", filter, output];
	}
</script>

<GifTool title="Optimize GIF" description="Reduce GIF file size by quantizing the palette and choosing a dithering algorithm." downloadName="optimized.gif" actionLabel="Optimize" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<Label>Max colors</Label>
				<span class="text-muted-foreground text-sm">{colors[0]}</span>
			</div>
			<Slider type="single" bind:value={colors} min={2} max={256} step={1} />
		</div>
		<div class="space-y-1.5">
			<Label>Dither</Label>
			<Select.Root type="single" bind:value={dither}>
				<Select.Trigger class="w-full">{dither}</Select.Trigger>
				<Select.Content>
					<Select.Item value="bayer">bayer</Select.Item>
					<Select.Item value="floyd_steinberg">floyd_steinberg</Select.Item>
					<Select.Item value="sierra2">sierra2</Select.Item>
					<Select.Item value="sierra2_4a">sierra2_4a</Select.Item>
					<Select.Item value="none">none</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</GifTool>
