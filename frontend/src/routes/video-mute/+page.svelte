<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";

	function build(input: string) {
		return {
			args: ["-i", input, "-c:v", "copy", "-an", "output.mp4"],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool title="Mute Video" description="Strip the audio track from a video without re-encoding video." accept="video/*" dropLabel="Click or drag & drop a video here" downloadName="muted.mp4" outputMime="video/mp4" actionLabel="Mute" buildArgs={build}>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. Audio track is removed; video stream is copied as-is.</p>
	{/snippet}
</GifTool>
