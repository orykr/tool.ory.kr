<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";

	function build(input: string, output: string) {
		void output;
		const filter = "split[a][b];[a]palettegen[p];[b][p]paletteuse";
		return {
			args: ["-i", input, "-filter_complex", filter, "output.gif"],
			outputName: "output.gif"
		};
	}
</script>

<GifTool
	title="WebP to GIF"
	description="Convert an animated WebP to a GIF."
	accept="image/webp"
	dropLabel="Click or drag & drop a WebP here"
	downloadName="output.gif"
	outputMime="image/gif"
	actionLabel="Convert"
	buildArgs={build}
>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. Palette is generated automatically.</p>
	{/snippet}
</GifTool>
