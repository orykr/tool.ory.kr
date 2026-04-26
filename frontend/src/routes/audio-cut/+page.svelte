<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let start = $state(0);
	let end = $state(30);
	let target = $state<"mp3" | "wav" | "ogg" | "m4a">("mp3");

	function build(input: string) {
		const s = Math.max(0, Number.isFinite(Number(start)) ? Number(start) : 0);
		const e = Math.max(s + 0.05, Number.isFinite(Number(end)) ? Number(end) : s + 1);
		const dur = e - s;
		const outName = `output.${target}`;
		const codec = target === "mp3" ? ["-c:a", "libmp3lame", "-b:a", "192k"]
			: target === "wav" ? ["-c:a", "pcm_s16le"]
			: target === "ogg" ? ["-c:a", "libvorbis", "-q:a", "5"]
			: ["-c:a", "aac", "-b:a", "192k"];
		return {
			args: ["-ss", s.toFixed(3), "-t", dur.toFixed(3), "-i", input, ...codec, outName],
			outputName: outName
		};
	}

	let mime = $derived(target === "mp3" ? "audio/mpeg" : target === "wav" ? "audio/wav" : target === "ogg" ? "audio/ogg" : "audio/mp4");
</script>

<GifTool
	title="Audio Cutter"
	description="Trim an audio file to a time range and export to the format of your choice."
	accept="audio/*"
	dropLabel="Click or drag & drop an audio file here"
	downloadName={`cut.${target}`}
	outputMime={mime}
	actionLabel="Cut"
	showSourceImage={false}
	buildArgs={build}
>
	{#snippet settings()}
		<div class="grid grid-cols-2 gap-3">
			<div class="space-y-1.5"><Label for="s">Start (sec)</Label><Input id="s" type="number" bind:value={start} min="0" step="0.1" /></div>
			<div class="space-y-1.5"><Label for="e">End (sec)</Label><Input id="e" type="number" bind:value={end} min="0" step="0.1" /></div>
		</div>
		<div class="space-y-1.5">
			<Label>Format</Label>
			<Select.Root type="single" bind:value={target}>
				<Select.Trigger class="w-full">{target.toUpperCase()}</Select.Trigger>
				<Select.Content>
					<Select.Item value="mp3">MP3</Select.Item>
					<Select.Item value="wav">WAV</Select.Item>
					<Select.Item value="ogg">OGG (Vorbis)</Select.Item>
					<Select.Item value="m4a">M4A (AAC)</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</GifTool>
