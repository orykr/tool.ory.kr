<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let mode = $state<"pad" | "crop">("pad");
	let bg = $state("#000000");

	function build(input: string) {
		const m = /^#([0-9a-fA-F]{6})$/.exec(bg);
		const c = m ? `0x${m[1]}` : "0x000000";
		const filter = mode === "pad"
			? `pad=max(iw\\,ih):max(iw\\,ih):(ow-iw)/2:(oh-ih)/2:color=${c}`
			: `crop=min(iw\\,ih):min(iw\\,ih)`;
		return {
			args: [
				"-i", input,
				"-vf", `${filter},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
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
	title="Make Square"
	description="Convert a GIF or video to a 1:1 square aspect ratio by padding or center-cropping. Perfect for Instagram."
	accept="image/gif,video/*"
	dropLabel="Click or drag & drop a GIF or video here"
	downloadName="square.mp4"
	outputMime="video/mp4"
	actionLabel="Make square"
	buildArgs={build}
>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label>Mode</Label>
			<Select.Root type="single" bind:value={mode}>
				<Select.Trigger class="w-full">{mode === "pad" ? "Pad with color (no crop)" : "Center crop (no pad)"}</Select.Trigger>
				<Select.Content>
					<Select.Item value="pad">Pad with color (no crop)</Select.Item>
					<Select.Item value="crop">Center crop (no pad)</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		{#if mode === "pad"}
			<div class="space-y-1.5"><Label for="bg">Pad color</Label><input id="bg" type="color" bind:value={bg} class="h-9 w-full rounded border" /></div>
		{/if}
	{/snippet}
</GifTool>
