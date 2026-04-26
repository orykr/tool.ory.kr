<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
</script>

<GifTool
	title="Reverse GIF"
	description="Play an animated GIF backwards."
	downloadName="reversed.gif"
	actionLabel="Reverse"
	buildArgs={(input, output) => [
		"-i", input,
		"-filter_complex", "[0:v]reverse,split[a][b];[a]palettegen[p];[b][p]paletteuse",
		output
	]}
>
	{#snippet settings()}
		<p class="text-muted-foreground text-sm">No options. Click reverse to flip the playback direction.</p>
	{/snippet}
</GifTool>
