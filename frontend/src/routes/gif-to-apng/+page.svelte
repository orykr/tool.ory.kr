<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";

	function build(input: string, output: string) {
		void output;
		return {
			args: [
				"-i", input,
				"-plays", "0",
				"-f", "apng",
				"output.png"
			],
			outputName: "output.png"
		};
	}
</script>

<GifTool
	title="GIF to APNG"
	description="Convert a GIF to an animated PNG (APNG). APNG preserves full color and alpha (no palette quantization)."
	downloadName="output.png"
	outputMime="image/apng"
	actionLabel="Convert"
	buildArgs={build}
>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. Plays infinitely on repeat.</p>
	{/snippet}
</GifTool>
