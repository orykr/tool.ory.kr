<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let mode = $state<"px" | "pct">("px");
	let width = $state(320);
	let height = $state<number | "">("");
	let percent = $state(50);
	let scaler = $state("lanczos");

	function build(input: string, output: string) {
		let scale: string;
		if (mode === "pct") {
			const f = Math.max(1, Number(percent)) / 100;
			scale = `scale=iw*${f}:ih*${f}:flags=${scaler}`;
		} else {
			const w = Math.max(1, Number(width));
			const h = height === "" || Number(height) <= 0 ? -1 : Math.max(1, Number(height));
			scale = `scale=${w}:${h}:flags=${scaler}`;
		}
		const filter = `${scale},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
		return ["-i", input, "-filter_complex", filter, output];
	}
</script>

<GifTool
	title="Resize GIF"
	description="Resize an animated GIF by pixel size or percentage. Generates an optimized palette automatically."
	downloadName="resized.gif"
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
				<div class="space-y-1.5"><Label for="w">Width</Label><Input id="w" type="number" bind:value={width} min="1" /></div>
				<div class="space-y-1.5"><Label for="h">Height</Label><Input id="h" type="number" bind:value={height} placeholder="auto" /></div>
			</div>
		{:else}
			<div class="space-y-1.5"><Label for="pct">Percent</Label><Input id="pct" type="number" bind:value={percent} min="1" max="500" /></div>
		{/if}
		<div class="space-y-1.5">
			<Label>Scaler</Label>
			<Select.Root type="single" bind:value={scaler}>
				<Select.Trigger class="w-full">{scaler}</Select.Trigger>
				<Select.Content>
					<Select.Item value="lanczos">lanczos (best)</Select.Item>
					<Select.Item value="bicubic">bicubic</Select.Item>
					<Select.Item value="bilinear">bilinear</Select.Item>
					<Select.Item value="neighbor">neighbor (pixel art)</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</GifTool>
