<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let count = $state(0);

	function build(input: string) {
		const c = Math.max(0, Math.min(65535, Number(count) || 0));
		const loopValue = c === 0 ? 0 : c - 1;
		return {
			args: [
				"-i", input,
				"-filter_complex", "split[a][b];[a]palettegen[p];[b][p]paletteuse",
				"-loop", String(loopValue),
				"output.gif"
			],
			outputName: "output.gif"
		};
	}
</script>

<GifTool title="GIF Loop Count" description="Set how many times an animated GIF should play. Use 0 for infinite." downloadName="looped.gif" outputMime="image/gif" actionLabel="Apply" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label for="c">Loop count</Label>
			<Input id="c" type="number" bind:value={count} min="0" max="65535" />
			<p class="text-muted-foreground text-xs">0 = infinite. Otherwise, the GIF plays exactly this many times.</p>
		</div>
	{/snippet}
</GifTool>
