<script lang="ts">
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { getFFmpeg, fetchFile, onFFmpegProgress } from "$lib/ffmpeg";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let {
		title,
		description,
		accept = "image/gif",
		dropLabel = "Click or drag & drop a GIF here",
		downloadName = "output.gif",
		outputMime = "image/gif",
		actionLabel = "Run",
		showSourceImage = true,
		settings,
		buildArgs
	}: {
		title: string;
		description: string;
		accept?: string;
		dropLabel?: string;
		downloadName?: string;
		outputMime?: string;
		actionLabel?: string;
		showSourceImage?: boolean;
		settings: Snippet;
		buildArgs: (input: string, output: string) => string[] | null | { args: string[]; outputName?: string };
	} = $props();

	let loaded = $state(false);
	let message = $state("Loading FFmpeg…");
	let progress = $state(0);
	let busy = $state(false);
	let file = $state<File | null>(null);
	let inputUrl = $state<string | null>(null);
	let outUrl = $state<string | null>(null);
	let outName = $state(downloadName);
	let isError = $derived(message.toLowerCase().includes("failed"));
	let runSeq = 0;

	onMount(async () => {
		const off = onFFmpegProgress((p) => { progress = p; if (busy) message = `Working… ${p}%`; });
		try { await getFFmpeg(); loaded = true; message = "Ready."; } catch { message = "Failed to load FFmpeg."; }
		return off;
	});

	function setFile(f: File) {
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		if (outUrl) URL.revokeObjectURL(outUrl);
		file = f; inputUrl = URL.createObjectURL(f); outUrl = null;
	}

	function reset() {
		file = null;
		if (inputUrl) URL.revokeObjectURL(inputUrl);
		inputUrl = null;
		if (outUrl) URL.revokeObjectURL(outUrl);
		outUrl = null;
	}

	export async function run() {
		if (!file || !loaded) return;
		const seq = ++runSeq;
		busy = true; progress = 0; message = "Working…";
		try {
			const ff = await getFFmpeg();
			const inExt = file.name.split(".").pop()?.toLowerCase() || "bin";
			const inputName = `input.${inExt}`;
			let outputName = downloadName;
			let result = buildArgs(inputName, outputName);
			if (!result) { busy = false; message = "Cancelled."; return; }
			let args: string[];
			if (Array.isArray(result)) {
				args = result;
			} else {
				args = result.args;
				if (result.outputName) outputName = result.outputName;
			}
			await ff.writeFile(inputName, await fetchFile(file));
			await ff.exec(args);
			if (seq !== runSeq) return;
			const data = await ff.readFile(outputName);
			const buf = (data as Uint8Array).buffer;
			if (seq !== runSeq) return;
			if (outUrl) URL.revokeObjectURL(outUrl);
			outUrl = URL.createObjectURL(new Blob([buf], { type: outputMime }));
			outName = outputName;
			message = "Done.";
		} catch (e) {
			console.error(e);
			if (seq === runSeq) message = "Failed.";
		} finally {
			if (seq === runSeq) busy = false;
		}
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
		<p class="text-muted-foreground mt-1">{description}</p>
	</header>

	<div class="mb-6 rounded-md border p-4 text-center text-sm {isError ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-muted text-muted-foreground'}">
		{message}
		{#if busy}<Progress value={progress} max={100} class="mt-3" />{/if}
	</div>

	{#if !file}
		<FileDrop {accept} label={dropLabel} onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					{#if showSourceImage && inputUrl}
						{#if file.type.startsWith("video/")}
							<!-- svelte-ignore a11y_media_has_caption -->
							<video src={inputUrl} controls class="w-full rounded-md"></video>
						{:else}
							<img src={inputUrl} alt="source" class="w-full rounded-md" />
						{/if}
					{:else}
						<div class="bg-muted text-muted-foreground rounded-md p-6 text-center text-sm">{file.name}</div>
					{/if}
					<Button variant="outline" class="w-full" onclick={reset}>Change file</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					{@render settings()}
					<Button class="w-full" onclick={run} disabled={!loaded || busy}>{busy ? "Working…" : actionLabel}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if outUrl}
		<Card.Root class="mt-6">
			<Card.Header><Card.Title class="text-base">Result</Card.Title></Card.Header>
			<Card.Content class="flex flex-col items-center gap-4">
				{#if outputMime.startsWith("video/")}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={outUrl} controls class="max-w-full rounded-md shadow-md"></video>
				{:else if outputMime.startsWith("image/")}
					<img src={outUrl} alt="result" class="max-w-full rounded-md shadow-md" />
				{:else}
					<a href={outUrl} download={outName} class="text-primary underline">{outName}</a>
				{/if}
				<Button href={outUrl} download={outName}><Download />Download</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
