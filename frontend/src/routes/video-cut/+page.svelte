<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let start = $state(0);
	let end = $state(5);

	function build(input: string) {
		const s = Math.max(0, Number(start) || 0);
		const e = Math.max(s + 0.05, Number(end) || s + 1);
		const dur = e - s;
		return {
			args: ["-ss", s.toFixed(3), "-t", dur.toFixed(3), "-i", input, "-c", "copy", "output.mp4"],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool
	title="Video Cutter"
	description="Trim a video to a time range without re-encoding (stream copy)."
	accept="video/*"
	dropLabel="Click or drag & drop a video here"
	downloadName="cut.mp4"
	outputMime="video/mp4"
	actionLabel="Cut"
	buildArgs={build}
>
	{#snippet settings()}
		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5"><Label for="s">Start (sec)</Label><Input id="s" type="number" bind:value={start} min="0" step="0.05" /></div>
			<div class="space-y-1.5"><Label for="e">End (sec)</Label><Input id="e" type="number" bind:value={end} min="0" step="0.05" /></div>
		</div>
	{/snippet}
</GifTool>
