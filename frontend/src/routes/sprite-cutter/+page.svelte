<script lang="ts">
	import { makeZip, type ZipEntry } from "$lib/zip";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import FileDrop from "$lib/components/file-drop.svelte";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Download from "@lucide/svelte/icons/download";

	let file = $state<File | null>(null);
	let imageUrl = $state<string | null>(null);
	let img = $state<HTMLImageElement | null>(null);
	let cols = $state(4);
	let rows = $state(4);
	let tileW = $state<number | "">("");
	let tileH = $state<number | "">("");
	let mode = $state<"grid" | "size">("grid");
	let tiles = $state<{ name: string; url: string; data: Uint8Array }[]>([]);
	let zipUrl = $state<string | null>(null);
	let busy = $state(false);
	let message = $state("Drop a sprite sheet to begin.");

	function setFile(f: File) {
		clearTiles();
		if (imageUrl) URL.revokeObjectURL(imageUrl);
		file = f; imageUrl = URL.createObjectURL(f);
		const i = new Image();
		i.onload = () => { img = i; message = `Loaded ${i.naturalWidth}×${i.naturalHeight}.`; };
		i.src = imageUrl;
	}

	function clearTiles() {
		for (const t of tiles) URL.revokeObjectURL(t.url);
		tiles = [];
		if (zipUrl) URL.revokeObjectURL(zipUrl);
		zipUrl = null;
	}

	async function run() {
		if (!img) return;
		busy = true; message = "Cutting…"; clearTiles();
		try {
			const W = img.naturalWidth, H = img.naturalHeight;
			let tw: number, th: number, nc: number, nr: number;
			if (mode === "grid") {
				nc = Math.max(1, Math.min(50, Number(cols) || 1));
				nr = Math.max(1, Math.min(50, Number(rows) || 1));
				tw = Math.floor(W / nc); th = Math.floor(H / nr);
			} else {
				tw = Math.max(1, Math.min(W, Number(tileW) || 32));
				th = Math.max(1, Math.min(H, Number(tileH) || 32));
				nc = Math.floor(W / tw); nr = Math.floor(H / th);
			}
			const out: typeof tiles = [];
			for (let r = 0; r < nr; r++) {
				for (let c = 0; c < nc; c++) {
					const cnv = document.createElement("canvas");
					cnv.width = tw; cnv.height = th;
					const ctx = cnv.getContext("2d");
					if (!ctx) throw new Error("No 2d context");
					ctx.drawImage(img, c * tw, r * th, tw, th, 0, 0, tw, th);
					const blob: Blob | null = await new Promise((res) => cnv.toBlob(res, "image/png"));
					if (!blob) continue;
					const ab = await blob.arrayBuffer();
					const data = new Uint8Array(ab);
					const url = URL.createObjectURL(blob);
					out.push({ name: `tile_r${r}_c${c}.png`, url, data });
				}
			}
			tiles = out;
			const entries: ZipEntry[] = out.map((t) => ({ name: t.name, data: t.data }));
			zipUrl = URL.createObjectURL(makeZip(entries));
			message = `Cut ${out.length} tile${out.length === 1 ? "" : "s"} (${nc}×${nr} @ ${tw}×${th}).`;
		} catch (e) { console.error(e); message = "Failed."; } finally { busy = false; }
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
	<nav class="mb-6"><a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"><ArrowLeft class="h-4 w-4" />Back to Tools</a></nav>
	<header class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Sprite Sheet Cutter</h1>
		<p class="text-muted-foreground mt-1">Slice a sprite sheet into individual tiles by grid or by tile size.</p>
	</header>
	<div class="mb-6 rounded-md border bg-muted text-muted-foreground p-4 text-center text-sm">{message}</div>

	{#if !file}
		<FileDrop accept="image/*" label="Click or drag & drop a sprite sheet" onfiles={(f) => setFile(f[0])} />
	{:else}
		<div class="grid gap-6 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Source</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<img src={imageUrl} alt="source" class="w-full rounded-md" />
					<Button variant="outline" class="w-full" onclick={() => { clearTiles(); file = null; if (imageUrl) URL.revokeObjectURL(imageUrl); imageUrl = null; img = null; }}>Change Image</Button>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Slice Settings</Card.Title></Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label>Mode</Label>
						<select bind:value={mode} class="border-input bg-background h-9 w-full rounded border px-3 text-sm">
							<option value="grid">By grid (cols × rows)</option>
							<option value="size">By tile size (px)</option>
						</select>
					</div>
					{#if mode === "grid"}
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1.5"><Label for="c">Columns</Label><Input id="c" type="number" bind:value={cols} min="1" max="50" /></div>
							<div class="space-y-1.5"><Label for="r">Rows</Label><Input id="r" type="number" bind:value={rows} min="1" max="50" /></div>
						</div>
					{:else}
						<div class="grid grid-cols-2 gap-3">
							<div class="space-y-1.5"><Label for="tw">Tile width (px)</Label><Input id="tw" type="number" bind:value={tileW} min="1" /></div>
							<div class="space-y-1.5"><Label for="th">Tile height (px)</Label><Input id="th" type="number" bind:value={tileH} min="1" /></div>
						</div>
					{/if}
					<Button class="w-full" onclick={run} disabled={!img || busy}>{busy ? "Working…" : "Cut"}</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if tiles.length}
		<Card.Root class="mt-6">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Tiles ({tiles.length})</Card.Title>
				{#if zipUrl}<Button href={zipUrl} download="tiles.zip"><Download />Download ZIP</Button>{/if}
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
					{#each tiles as t (t.name)}
						<a href={t.url} download={t.name} class="border-input hover:border-primary block rounded border p-1 text-center text-[10px]">
							<img src={t.url} alt={t.name} class="mb-1 w-full rounded" />{t.name}
						</a>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
