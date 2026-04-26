<script lang="ts">
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import X from "@lucide/svelte/icons/x";

	type Clip = { url: string; file: File };
	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let clips = $state<Clip[]>([]);
	let outUrl = $state<string | null>(null);
	let outW = $state(1280);
	let outH = $state(720);
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Merging… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	function add(files: File[]) {
		const vids = files.filter((f) => f.type.startsWith("video/"));
		clips = [...clips, ...vids.map((f) => ({ url: URL.createObjectURL(f), file: f }))];
	}
	function remove(i: number) { URL.revokeObjectURL(clips[i].url); clips = clips.filter((_, j) => j !== i); }
	function move(i: number, j: number) {
		if (j < 0 || j >= clips.length) return;
		const a = [...clips]; const [m] = a.splice(i, 1); a.splice(j, 0, m); clips = a;
	}

	async function run() {
		if (!loaded || clips.length < 2) return;
		const seq = ++runSeq;
		const snap = clips.slice();
		busy = true; progress = 0; message = "Preparing…";
		try {
			const ff = await getFFmpeg();
			for (let i = 0; i < snap.length; i++) {
				if (seq !== runSeq) return;
				const ext = snap[i].file.name.split(".").pop()?.toLowerCase() || "mp4";
				await ff.writeFile(`v_${i.toString().padStart(2, "0")}.${ext}`, await fetchFile(snap[i].file));
			}
			const w = Math.max(2, outW & ~1), h = Math.max(2, outH & ~1);
			const inputArgs: string[] = [];
			const filterParts: string[] = [];
			for (let i = 0; i < snap.length; i++) {
				const ext = snap[i].file.name.split(".").pop()?.toLowerCase() || "mp4";
				inputArgs.push("-i", `v_${i.toString().padStart(2, "0")}.${ext}`);
				filterParts.push(`[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];[${i}:a]aresample=async=1[a${i}]`);
			}
			const concatLabels = snap.map((_, i) => `[v${i}][a${i}]`).join("");
			const filter = filterParts.join(";") + `;${concatLabels}concat=n=${snap.length}:v=1:a=1[outv][outa]`;
			message = "Encoding…";
			await ff.exec([
				...inputArgs,
				"-filter_complex", filter,
				"-map", "[outv]", "-map", "[outa]",
				"-c:v", "libx264", "-preset", "medium", "-crf", "23",
				"-c:a", "aac", "-b:a", "192k",
				"-pix_fmt", "yuv420p",
				"output.mp4"
			]);
			if (seq !== runSeq) return;
			const data = await ff.readFile("output.mp4") as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "video/mp4" }));
			message = "Done.";
		} catch (e) {
			console.error(e);
			if (seq === runSeq) message = "Failed.";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Video Merger</h1>
		<p class="text-muted-foreground mt-1">Concatenate multiple videos into one MP4. Each clip is normalized to a common frame size and 30 fps before concat.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	<FileDrop accept="video/*" multiple label="Click or drag & drop video clips (multi-select)" onfiles={add} />

	{#if clips.length}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Clips ({clips.length})</Card.Title></Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-3">
					{#each clips as c, i (c.url)}
						<div class="bg-card flex w-44 flex-col items-center gap-2 rounded-md border p-2">
							<!-- svelte-ignore a11y_media_has_caption -->
							<video src={c.url} controls class="h-24 w-full rounded object-contain"></video>
							<span class="text-muted-foreground line-clamp-1 w-full text-center text-[10px]">{c.file.name}</span>
							<div class="flex w-full items-center gap-1">
								<Button variant="outline" size="icon-sm" onclick={() => move(i, i - 1)} disabled={i === 0}><ChevronLeft /></Button>
								<span class="text-muted-foreground flex-1 text-center text-xs">{i + 1}</span>
								<Button variant="outline" size="icon-sm" onclick={() => move(i, i + 1)} disabled={i === clips.length - 1}><ChevronRight /></Button>
								<Button variant="destructive" size="icon-sm" onclick={() => remove(i)}><X /></Button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Output</Card.Title></Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-1.5"><Label for="ow">Width</Label><Input id="ow" type="number" bind:value={outW} min="64" /></div>
					<div class="space-y-1.5"><Label for="oh">Height</Label><Input id="oh" type="number" bind:value={outH} min="64" /></div>
				</div>
				<Button class="w-full" onclick={run} disabled={!loaded || busy || clips.length < 2}>{busy ? "Working…" : "Merge"}</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				<Button href={outUrl} download="merged.mp4"><Download />Download MP4</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
