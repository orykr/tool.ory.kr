<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";

	let target = $state<"mp4" | "webm" | "mov" | "avi" | "mkv">("mp4");

	function build(input: string) {
		let outName = `output.${target}`;
		const args: string[] = ["-i", input];
		if (target === "mp4" || target === "mov") {
			args.push(
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-pix_fmt", "yuv420p",
				"-c:a", "aac", "-b:a", "128k",
				"-movflags", "+faststart"
			);
		} else if (target === "webm") {
			args.push("-c:v", "libvpx-vp9", "-b:v", "1M", "-c:a", "libopus", "-b:a", "128k");
		} else if (target === "avi") {
			args.push("-c:v", "mpeg4", "-q:v", "5", "-c:a", "mp3");
		} else if (target === "mkv") {
			args.push("-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-b:a", "128k");
		}
		args.push(outName);
		return { args, outputName: outName };
	}

	let mime = $derived(target === "mp4" ? "video/mp4" : target === "webm" ? "video/webm" : target === "mov" ? "video/quicktime" : target === "avi" ? "video/x-msvideo" : "video/x-matroska");
</script>

<GifTool
	title="Video Format Converter"
	description="Convert video between MP4, WebM, MOV, AVI, and MKV containers."
	accept="video/*"
	dropLabel="Click or drag & drop a video here"
	downloadName={`output.${target}`}
	outputMime={mime}
	actionLabel="Convert"
	buildArgs={build}
>
	{#snippet settings()}
		<div class="space-y-1.5">
			<Label>Target format</Label>
			<Select.Root type="single" bind:value={target}>
				<Select.Trigger class="w-full">{target.toUpperCase()}</Select.Trigger>
				<Select.Content>
					<Select.Item value="mp4">MP4 (H.264 / AAC)</Select.Item>
					<Select.Item value="webm">WebM (VP9 / Opus)</Select.Item>
					<Select.Item value="mov">MOV (H.264 / AAC)</Select.Item>
					<Select.Item value="avi">AVI (MPEG-4 / MP3)</Select.Item>
					<Select.Item value="mkv">MKV (H.264 / AAC)</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</GifTool>
