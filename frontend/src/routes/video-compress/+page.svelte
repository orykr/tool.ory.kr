<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let crf = $state([28]);
	let preset = $state("medium");

	function build(input: string) {
		const q = Math.max(15, Math.min(40, crf[0]));
		return {
			args: [
				"-i", input,
				"-c:v", "libx264", "-preset", preset, "-crf", String(q),
				"-c:a", "aac", "-b:a", "128k",
				"-pix_fmt", "yuv420p",
				"-movflags", "+faststart",
				"output.mp4"
			],
			outputName: "output.mp4"
		};
	}
</script>

<GifTool title="Video Compressor" description="Re-encode video at higher CRF (lower quality, smaller size). 18=visually lossless, 28=default, 35=heavy compression." accept="video/*" dropLabel="Click or drag & drop a video here" downloadName="compressed.mp4" outputMime="video/mp4" actionLabel="Compress" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>CRF (quality)</Label><span class="text-muted-foreground text-sm">{crf[0]}</span></div>
			<Slider type="single" bind:value={crf} min={15} max={40} step={1} />
			<p class="text-muted-foreground text-xs">Lower = better quality, larger file. Higher = smaller, more loss.</p>
		</div>
		<div class="space-y-1.5">
			<Label>Preset</Label>
			<Select.Root type="single" bind:value={preset}>
				<Select.Trigger class="w-full">{preset}</Select.Trigger>
				<Select.Content>
					<Select.Item value="ultrafast">ultrafast</Select.Item>
					<Select.Item value="superfast">superfast</Select.Item>
					<Select.Item value="veryfast">veryfast</Select.Item>
					<Select.Item value="faster">faster</Select.Item>
					<Select.Item value="fast">fast</Select.Item>
					<Select.Item value="medium">medium (default)</Select.Item>
					<Select.Item value="slow">slow</Select.Item>
					<Select.Item value="slower">slower</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</GifTool>
