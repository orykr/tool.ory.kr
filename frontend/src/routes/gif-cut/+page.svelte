<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let start = $state(0);
	let end = $state(3);

	function build(input: string, output: string) {
		const s = Math.max(0, Number(start) || 0);
		const e = Math.max(s + 0.05, Number(end) || s + 1);
		const dur = e - s;
		return [
			"-ss", s.toFixed(3),
			"-t", dur.toFixed(3),
			"-i", input,
			"-filter_complex", "split[a][b];[a]palettegen[p];[b][p]paletteuse",
			output
		];
	}
</script>

<GifTool title="Cut / Trim GIF" description="Trim a GIF to a time range. Specify start and end in seconds." downloadName="cut.gif" actionLabel="Trim" buildArgs={build}>
	{#snippet settings()}
		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5"><Label for="s">Start (sec)</Label><Input id="s" type="number" bind:value={start} min="0" step="0.05" /></div>
			<div class="space-y-1.5"><Label for="e">End (sec)</Label><Input id="e" type="number" bind:value={end} min="0" step="0.05" /></div>
		</div>
	{/snippet}
</GifTool>
