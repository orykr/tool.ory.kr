<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let thickness = $state(10);
	let color = $state("#000000");

	function build(input: string) {
		const t = Math.max(1, Math.min(500, Number(thickness) || 1));
		const m = /^#([0-9a-fA-F]{6})$/.exec(color);
		const c = m ? `0x${m[1]}` : "0x000000";
		const filter = `pad=iw+${t * 2}:ih+${t * 2}:${t}:${t}:color=${c},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
		return {
			args: ["-i", input, "-filter_complex", filter, "output.gif"],
			outputName: "output.gif"
		};
	}
</script>

<GifTool title="Add Border to GIF" description="Add a colored border around an animated GIF." downloadName="bordered.gif" outputMime="image/gif" actionLabel="Apply" buildArgs={build}>
	{#snippet settings()}
		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5"><Label for="t">Thickness (px)</Label><Input id="t" type="number" bind:value={thickness} min="1" max="500" /></div>
			<div class="space-y-1.5"><Label for="c">Color</Label><input id="c" type="color" bind:value={color} class="h-9 w-full rounded border" /></div>
		</div>
	{/snippet}
</GifTool>
