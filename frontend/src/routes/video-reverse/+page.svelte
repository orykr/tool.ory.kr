<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";

	let withAudio = $state(false);

	function build(input: string) {
		const args = ["-i", input, "-vf", "reverse"];
		if (withAudio) args.push("-af", "areverse"); else args.push("-an");
		args.push("-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "output.mp4");
		return { args, outputName: "output.mp4" };
	}
</script>

<GifTool title="Video Reverser" description="Reverse a video. Optionally also reverse the audio track." accept="video/*" dropLabel="Click or drag & drop a video here" downloadName="reversed.mp4" outputMime="video/mp4" actionLabel="Reverse" buildArgs={build}>
	{#snippet settings()}
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={withAudio} /> Also reverse audio</label>
	{/snippet}
</GifTool>
