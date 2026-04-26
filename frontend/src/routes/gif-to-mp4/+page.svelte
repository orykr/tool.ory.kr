<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";

	function build(input: string, output: string) {
		void output;
		return {
			args: [
				"-i", input,
				"-movflags", "+faststart",
				"-pix_fmt", "yuv420p",
				"-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
				"-c:v", "libx264",
				"-preset", "medium",
				"-crf", "23",
				"output.mp4"
			],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool
	title="GIF to MP4"
	description="Convert an animated GIF to an MP4 (H.264) video. Smaller file size and broader compatibility for embedding."
	downloadName="output.mp4"
	outputMime="video/mp4"
	actionLabel="Convert"
	buildArgs={build}
>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. The encoder uses libx264 yuv420p with a faststart MOOV.</p>
	{/snippet}
</GifTool>
