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
	import X from "@lucide/svelte/icons/x";

	const FRAME_LIMIT = 500;
	type Frame = { name: string; url: string; data: Uint8Array; delayCs: number; keep: boolean };
	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let file = $state<File | null>(null);
	let inputUrl = $state<string | null>(null);
	let frames = $state<Frame[]>([]);
	let outUrl = $state<string | null>(null);
	let defaultDelay = $state(10);
	let isError = $derived(message.toLowerCase().includes("failed"));

	onMount(() => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Working… ${p}%`; });
		(async () => { try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; } })();
		return off;
	});

	async function cleanFrames(ff: any) {
		for (let i = 1; i <= FRAME_LIMIT; i++) {
			const name = `frame_${i.toString().padStart(4, "0")}.png`;
			try { await ff.deleteFile(name); } catch { break; }
		}
		for (let i = 0; i < FRAME_LIMIT; i++) {
			const name = `kf_${i.toString().padStart(4, "0")}.png`;
			try { await ff.deleteFile(name); } catch { break; }
		}
	}

	function clearFrames() {
		for (const f of frames) URL.revokeObjectURL(f.url);
		frames = [];
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = null;
	}

	function setFile(f: File) {
		clearFrames();
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		file = f; inputUrl = URL.createObjectURL(f);
	}

	async function decode() {
		if (!file || !loaded) return;
		busy = true; progress = 0; message = "Decoding frames…";
		clearFrames();
		try {
			const ff = await getFFmpeg();
			await cleanFrames(ff);
			await ff.writeFile("input.gif", await fetchFile(file));
			await ff.exec(["-i", "input.gif", "-vsync", "0", "frame_%04d.png"]);
			const out: Frame[] = [];
			for (let i = 1; i <= FRAME_LIMIT; i++) {
				const name = `frame_${i.toString().padStart(4, "0")}.png`;
				try {
					const data = await ff.readFile(name) as Uint8Array;
					if (!data || data.length === 0) break;
					const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
					const url = URL.createObjectURL(new Blob([buf], { type: "image/png" }));
					out.push({ name, url, data, delayCs: defaultDelay, keep: true });
				} catch { break; }
			}
			frames = out;
			message = out.length ? `Loaded ${out.length} frames.` : "No frames found.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}

	async function rebuild() {
		if (!frames.length || !loaded) return;
		const kept = frames.filter((f) => f.keep);
		if (!kept.length) { message = "All frames are removed."; return; }
		busy = true; progress = 0; message = "Re-encoding…";
		try {
			const ff = await getFFmpeg();
			let concat = "";
			for (let i = 0; i < kept.length; i++) {
				const fname = `kf_${i.toString().padStart(4, "0")}.png`;
				await ff.writeFile(fname, kept[i].data);
				const seconds = Math.max(0.02, kept[i].delayCs / 100);
				concat += `file '${fname}'\nduration ${seconds.toFixed(3)}\n`;
			}
			concat += `file '${`kf_${(kept.length - 1).toString().padStart(4, "0")}.png`}'\n`;
			await ff.writeFile("list.txt", new TextEncoder().encode(concat));
			await ff.exec([
				"-f", "concat", "-safe", "0", "-i", "list.txt",
				"-filter_complex", "split[a][b];[a]palettegen[p];[b][p]paletteuse",
				"output.gif"
			]);
			const data = await ff.readFile("output.gif") as Uint8Array;
			const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: "image/gif" }));
			message = "Done.";
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}

	function setAllDelays() {
		frames = frames.map((f) => ({ ...f, delayCs: defaultDelay }));
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">GIF Frame Editor</h1>
		<p class="text-muted-foreground mt-1">Inspect every frame of a GIF, remove unwanted frames, set per-frame delay, then re-encode.</p>
	</header>
	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">{message}{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}</div>

	{#if !file}
		<FileDrop accept="image/gif" label="Click or drag & drop a GIF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="mb-6 grid gap-4 md:grid-cols-3">
			<Card.Root class="md:col-span-1">
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={inputUrl} alt="source" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { clearFrames(); file = null; if (inputUrl) URL.revokeObjectURL(inputUrl); inputUrl = null; }}>Change GIF</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root class="md:col-span-2">
				<Card.Header><Card.Title class="text-base">Actions</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Button class="w-full" onclick={decode} disabled={!loaded || busy}>{busy ? "Working…" : "Decode Frames"}</Button>
					{#if frames.length}
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1.5"><Label for="dd">Delay (1/100s)</Label><Input id="dd" type="number" bind:value={defaultDelay} min="2" max="1000" /></div>
							<Button variant="outline" onclick={setAllDelays}>Apply to all</Button>
						</div>
						<Button class="w-full" onclick={rebuild} disabled={busy}>{busy ? "Working…" : "Rebuild GIF"}</Button>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if frames.length}
		<Card.Root class="mb-6">
			<Card.Header><Card.Title class="text-base">Frames ({frames.filter(f=>f.keep).length}/{frames.length})</Card.Title></Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{#each frames as fr, i (fr.name)}
						<div class="border-input rounded border p-1 text-xs {fr.keep ? '' : 'opacity-30'}">
							<img src={fr.url} alt={fr.name} class="mb-1 w-full rounded" />
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">#{i + 1}</span>
								<button type="button" onclick={() => frames[i].keep = !frames[i].keep} class="text-destructive hover:underline">{fr.keep ? "Remove" : "Restore"}</button>
							</div>
							<input type="number" min="2" bind:value={frames[i].delayCs} class="border-input mt-1 w-full rounded border px-1 py-0.5 text-xs" />
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if outUrl}
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				<Button href={outUrl} download="rebuilt.gif"><Download />Download GIF</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
