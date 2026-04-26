<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let mode = $state<"px" | "pct">("px");
	let width = $state(640);
	let height = $state<number | "">("");
	let percent = $state(50);

	function build(input: string) {
		let scale: string;
		if (mode === "pct") {
			const f = Math.max(1, Number(percent)) / 100;
			scale = `scale=trunc(iw*${f}/2)*2:trunc(ih*${f}/2)*2`;
		} else {
			const w = Math.max(2, Number(width));
			const h = height === "" || Number(height) <= 0 ? -2 : Math.max(2, Number(height));
			scale = `scale=${w}:${h}`;
		}
		return {
			args: [
				"-i", input,
				"-vf", scale,
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "copy",
				"-pix_fmt", "yuv420p",
				"output.mp4"
			],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool
	title="Video Resizer"
	description="Resize a video. Output is H.264 MP4 with the original audio stream kept."
	accept="video/*"
	dropLabel="Click or drag & drop a video here"
	downloadName="resized.mp4"
	outputMime="video/mp4"
	actionLabel="Resize"
	buildArgs={build}
>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label>Mode</Label>
			<Select.Root type="single" bind:value={mode}>
				<Select.Trigger class="w-full">{mode === "px" ? "Pixels" : "Percent"}</Select.Trigger>
				<Select.Content>
					<Select.Item value="px">Pixels</Select.Item>
					<Select.Item value="pct">Percent</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		{#if mode === "px"}
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-1.5"><Label for="w">Width</Label><Input id="w" type="number" bind:value={width} min="2" /></div>
				<div class="space-y-1.5"><Label for="h">Height</Label><Input id="h" type="number" bind:value={height} placeholder="auto" /></div>
			</div>
		{:else}
			<div class="space-y-1.5"><Label for="pct">Percent</Label><Input id="pct" type="number" bind:value={percent} min="1" max="500" /></div>
		{/if}
	{/snippet}
</GifTool>
