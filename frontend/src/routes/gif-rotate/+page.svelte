<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let rotation = $state<"0" | "90" | "180" | "270">("90");
	let flipH = $state(false);
	let flipV = $state(false);

	function build(input: string, output: string) {
		const ops: string[] = [];
		if (rotation === "90") ops.push("transpose=1");
		else if (rotation === "180") ops.push("transpose=1", "transpose=1");
		else if (rotation === "270") ops.push("transpose=2");
		if (flipH) ops.push("hflip");
		if (flipV) ops.push("vflip");
		const filter = `${ops.length ? ops.join(",") : "null"},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
		return ["-i", input, "-filter_complex", filter, output];
	}
</script>

<GifTool title="Rotate GIF" description="Rotate or flip an animated GIF in 90° increments." downloadName="rotated.gif" actionLabel="Rotate" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label>Rotation</Label>
			<Select.Root type="single" bind:value={rotation}>
				<Select.Trigger class="w-full">{rotation}°</Select.Trigger>
				<Select.Content>
					<Select.Item value="0">0°</Select.Item>
					<Select.Item value="90">90° clockwise</Select.Item>
					<Select.Item value="180">180°</Select.Item>
					<Select.Item value="270">90° counter-clockwise</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={flipH} /> Flip horizontally</label>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={flipV} /> Flip vertically</label>
	{/snippet}
</GifTool>
