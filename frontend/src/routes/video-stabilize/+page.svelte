<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let strength = $state([5]);

	function build(input: string) {
		const r = Math.max(1, Math.min(20, strength[0]));
		return {
			args: [
				"-i", input,
				"-vf", `deshake=rx=${r}:ry=${r}`,
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "copy",
				"-pix_fmt", "yuv420p",
				"output.mp4"
			],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool title="Video Stabilizer" description="Reduce camera shake using ffmpeg's deshake filter." accept="video/*" dropLabel="Click or drag & drop a video here" downloadName="stable.mp4" outputMime="video/mp4" actionLabel="Stabilize" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Strength</Label><span class="text-muted-foreground text-sm">{strength[0]}</span></div>
			<Slider type="multiple" bind:value={strength} min={1} max={20} step={1} />
			<p class="text-muted-foreground text-xs">Higher values search for motion across a larger window. Use ~5 for slight shake, ~15 for severe.</p>
		</div>
	{/snippet}
</GifTool>
