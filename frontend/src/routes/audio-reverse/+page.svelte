<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let target = $state<"mp3" | "wav" | "ogg" | "m4a">("mp3");

	function build(input: string) {
		const outName = `output.${target}`;
		const codec = target === "mp3" ? ["-c:a", "libmp3lame", "-b:a", "192k"]
			: target === "wav" ? ["-c:a", "pcm_s16le"]
			: target === "ogg" ? ["-c:a", "libvorbis", "-q:a", "5"]
			: ["-c:a", "aac", "-b:a", "192k"];
		return {
			args: ["-i", input, "-af", "areverse", ...codec, outName],
			outputName: outName
		};
	}

	let mime = $derived(target === "mp3" ? "audio/mpeg" : target === "wav" ? "audio/wav" : target === "ogg" ? "audio/ogg" : "audio/mp4");
</script>

<GifTool
	title="Audio Reverser"
	description="Play an audio file backwards."
	accept="audio/*,video/*"
	dropLabel="Click or drag & drop an audio file here"
	downloadName={`reverse.${target}`}
	outputMime={mime}
	actionLabel="Reverse"
	showSourceImage={false}
	buildArgs={build}
>
	{#snippet settings()}
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
