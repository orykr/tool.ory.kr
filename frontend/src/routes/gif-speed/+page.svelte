<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let speed = $state([1.5]);

	function build(input: string, output: string) {
		const s = Math.max(0.1, Math.min(10, speed[0]));
		const filter = `setpts=PTS/${s},split[a][b];[a]palettegen[p];[b][p]paletteuse`;
		return ["-i", input, "-filter_complex", filter, output];
	}
</script>

<GifTool title="Change GIF Speed" description="Speed up or slow down a GIF by a factor (1× = original)." downloadName="speed.gif" actionLabel="Apply" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<Label>Speed multiplier</Label>
				<span class="text-muted-foreground text-sm">{speed[0].toFixed(2)}×</span>
			</div>
			<Slider type="multiple" bind:value={speed} min={0.1} max={5} step={0.05} />
			<Input type="number" bind:value={speed[0]} min="0.1" max="10" step="0.1" />
		</div>
	{/snippet}
</GifTool>
