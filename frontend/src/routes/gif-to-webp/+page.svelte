<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let quality = $state([75]);
	let lossless = $state(false);

	function build(input: string, output: string) {
		void output;
		const args = [
			"-i", input,
			"-vcodec", "libwebp",
			"-loop", "0",
			"-an",
			"-vsync", "0",
			"-q:v", String(quality[0]),
			"-lossless", lossless ? "1" : "0",
			"output.webp"
		];
		return { args, outputName: "output.webp" };
	}
</script>

<GifTool title="GIF to WebP" description="Convert a GIF to an animated WebP. WebP often produces much smaller files at the same quality." downloadName="output.webp" outputMime="image/webp" actionLabel="Convert" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Quality</Label><span class="text-muted-foreground text-sm">{quality[0]}</span></div>
			<Slider type="multiple" bind:value={quality} min={1} max={100} step={1} />
		</div>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={lossless} /> Lossless</label>
	{/snippet}
</GifTool>
