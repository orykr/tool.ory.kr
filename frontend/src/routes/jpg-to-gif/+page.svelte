<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";

	function build(input: string, output: string) {
		void output;
		return {
			args: [
				"-i", input,
				"-vf", "scale=trunc(iw/1)*1:-1,split[a][b];[a]palettegen[p];[b][p]paletteuse",
				"output.gif"
			],
			outputName: "output.gif"
		};
	}
</script>

<GifTool
	title="JPG to GIF"
	description="Convert a static JPG, PNG, or WebP image into a single-frame GIF."
	accept="image/jpeg,image/png,image/webp,image/bmp"
	dropLabel="Click or drag & drop an image here"
	downloadName="output.gif"
	outputMime="image/gif"
	actionLabel="Convert"
	buildArgs={build}
>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. Static image is wrapped as a 1-frame GIF.</p>
	{/snippet}
</GifTool>
