<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import * as Select from "$lib/components/ui/select/index.js";

	let speed = $state([1.5]);
	let target = $state<"mp3" | "wav" | "ogg" | "m4a">("mp3");

	function build(input: string) {
		const s = Math.max(0.1, Math.min(10, speed[0]));
		let remaining = s;
		const factors: number[] = [];
		while (remaining > 2.0) { factors.push(2.0); remaining /= 2.0; }
		while (remaining < 0.5) { factors.push(0.5); remaining /= 0.5; }
		factors.push(remaining);
		const af = factors.map((f) => `atempo=${f.toFixed(4)}`).join(",");
		const outName = `output.${target}`;
		const codec = target === "mp3" ? ["-c:a", "libmp3lame", "-b:a", "192k"]
			: target === "wav" ? ["-c:a", "pcm_s16le"]
			: target === "ogg" ? ["-c:a", "libvorbis", "-q:a", "5"]
			: ["-c:a", "aac", "-b:a", "192k"];
		return {
			args: ["-i", input, "-af", af, ...codec, outName],
			outputName: outName
		};
	}

	let mime = $derived(target === "mp3" ? "audio/mpeg" : target === "wav" ? "audio/wav" : target === "ogg" ? "audio/ogg" : "audio/mp4");
</script>

<GifTool
	title="Audio Speed Changer"
	description="Speed up or slow down audio with pitch-preserving atempo chains."
	accept="audio/*,video/*"
	dropLabel="Click or drag & drop an audio file here"
	downloadName={`speed.${target}`}
	outputMime={mime}
	actionLabel="Apply"
	showSourceImage={false}
	buildArgs={build}
>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Speed multiplier</Label><span class="text-muted-foreground text-sm">{speed[0].toFixed(2)}×</span></div>
			<Slider type="single" bind:value={speed} min={0.1} max={5} step={0.05} />
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
