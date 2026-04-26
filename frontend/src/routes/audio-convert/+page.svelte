<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	let target = $state<"mp3" | "wav" | "ogg" | "m4a" | "flac">("mp3");
	let bitrate = $state(192);

	function build(input: string) {
		const outName = `output.${target}`;
		let codec: string[];
		if (target === "mp3") codec = ["-c:a", "libmp3lame", "-b:a", `${bitrate}k`];
		else if (target === "wav") codec = ["-c:a", "pcm_s16le"];
		else if (target === "ogg") codec = ["-c:a", "libvorbis", "-q:a", "5"];
		else if (target === "m4a") codec = ["-c:a", "aac", "-b:a", `${bitrate}k`];
		else codec = ["-c:a", "flac"];
		return {
			args: ["-i", input, "-vn", ...codec, outName],
			outputName: outName
		};
	}

	let mime = $derived(target === "mp3" ? "audio/mpeg" : target === "wav" ? "audio/wav" : target === "ogg" ? "audio/ogg" : target === "flac" ? "audio/flac" : "audio/mp4");
</script>

<GifTool
	title="Audio Format Converter"
	description="Convert between MP3, WAV, OGG, M4A, and FLAC."
	accept="audio/*,video/*"
	dropLabel="Click or drag & drop an audio file here"
	downloadName={`output.${target}`}
	outputMime={mime}
	actionLabel="Convert"
	showSourceImage={false}
	buildArgs={build}
>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label>Target format</Label>
			<Select.Root type="single" bind:value={target}>
				<Select.Trigger class="w-full">{target.toUpperCase()}</Select.Trigger>
				<Select.Content>
					<Select.Item value="mp3">MP3</Select.Item>
					<Select.Item value="wav">WAV</Select.Item>
					<Select.Item value="ogg">OGG (Vorbis)</Select.Item>
					<Select.Item value="m4a">M4A (AAC)</Select.Item>
					<Select.Item value="flac">FLAC</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		{#if target === "mp3" || target === "m4a"}
			<div class="space-y-1.5"><Label for="br">Bitrate (kbps)</Label><Input id="br" type="number" bind:value={bitrate} min="32" max="320" step="32" /></div>
		{/if}
	{/snippet}
</GifTool>
