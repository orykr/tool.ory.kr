<script lang="ts">
	import GifTool from "$lib/components/gif-filter-tool.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let speed = $state([1.5]);
	let keepAudio = $state(true);

	function build(input: string) {
		const s = Math.max(0.1, Math.min(10, speed[0]));
		const vf = `setpts=PTS/${s}`;
		const args: string[] = ["-i", input, "-vf", vf];
		if (keepAudio && s >= 0.5 && s <= 100) {
			let remaining = s;
			const factors: number[] = [];
			while (remaining > 2.0) { factors.push(2.0); remaining /= 2.0; }
			while (remaining < 0.5) { factors.push(0.5); remaining /= 0.5; }
			factors.push(remaining);
			const af = factors.map((f) => `atempo=${f.toFixed(4)}`).join(",");
			args.push("-af", af);
		} else {
			args.push("-an");
		}
		args.push("-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "output.mp4");
		return { args, outputName: "output.mp4" };
	}
</script>

<GifTool title="Video Speed" description="Speed up or slow down a video. Audio is pitch-preserved when within atempo's range." accept="video/*" dropLabel="Click or drag & drop a video here" downloadName="speed.mp4" outputMime="video/mp4" actionLabel="Apply" buildArgs={build}>
	{#snippet settings()}
		<div class="space-y-2">
			<div class="flex items-center justify-between"><Label>Speed multiplier</Label><span class="text-muted-foreground text-sm">{speed[0].toFixed(2)}×</span></div>
			<Slider type="multiple" bind:value={speed} min={0.1} max={5} step={0.05} />
		</div>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={keepAudio} /> Keep audio (pitch-preserved)</label>
	{/snippet}
</GifTool>
