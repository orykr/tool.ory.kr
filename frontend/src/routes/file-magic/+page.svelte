<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { identify, bytesToHex, bytesToAscii, type MagicMatch } from "$lib/file-magic";

	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let bytes = $state<Uint8Array | null>(null);
	let matches = $state<MagicMatch[]>([]);
	let error = $state<string | null>(null);
	let isDragging = $state(false);

	async function processFile(file: File | undefined) {
		if (!file) return;
		try {
			const buf = await file.slice(0, 64).arrayBuffer();
			bytes = new Uint8Array(buf);
			fileName = file.name;
			fileSize = file.size;
			matches = identify(bytes);
			error = null;
		} catch (e) {
			error = (e as Error).message;
			bytes = null;
			matches = [];
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		processFile(target.files?.[0]);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		processFile(e.dataTransfer?.files[0]);
	}

	function clear() {
		fileName = null;
		fileSize = 0;
		bytes = null;
		matches = [];
		error = null;
	}

	function formatSize(b: number): string {
		if (b < 1024) return `${b} B`;
		if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
		return `${(b / 1024 / 1024).toFixed(2)} MB`;
	}
</script>

<main class="container mx-auto max-w-3xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">File Type Detector</h1>
		<p class="text-muted-foreground mt-1">
			Inspect a file's magic bytes to identify its real type — extension is ignored.
		</p>
	</header>

	{#if !fileName}
		<button
			type="button"
			class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
				? 'border-primary bg-primary/5 text-primary'
				: 'border-border'}"
			onclick={() => document.getElementById("magic-input")?.click()}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<Upload class="h-10 w-10" />
			<p class="text-base font-medium">Click or Drag & Drop a file here</p>
			<p class="text-xs">Only the first 64 bytes are read locally.</p>
			<input id="magic-input" type="file" onchange={handleFileSelect} class="hidden" />
		</button>
	{:else}
		<Card.Root class="mb-4">
			<Card.Content class="flex items-center justify-between pt-6">
				<div>
					<p class="text-sm font-medium">{fileName}</p>
					<p class="text-muted-foreground text-xs">{formatSize(fileSize)}</p>
				</div>
				<Button variant="ghost" size="sm" onclick={clear}>
					<Trash2 />
					Remove
				</Button>
			</Card.Content>
		</Card.Root>

		{#if bytes}
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">First 16 bytes</Card.Title></Card.Header>
				<Card.Content>
					<dl class="grid grid-cols-[100px_1fr] gap-2 text-sm">
						<dt class="text-muted-foreground">Hex</dt>
						<dd class="font-mono break-all">{bytesToHex(bytes)}</dd>
						<dt class="text-muted-foreground">ASCII</dt>
						<dd class="font-mono break-all">{bytesToAscii(bytes)}</dd>
					</dl>
				</Card.Content>
			</Card.Root>
		{/if}

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Detected ({matches.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if matches.length === 0}
					<p class="text-muted-foreground text-sm">
						No known magic bytes matched. The file might be plain text, an unsupported format, or
						intentionally unmarked.
					</p>
				{:else}
					<ul class="space-y-2">
						{#each matches as m, i (i)}
							<li class="bg-muted rounded-md p-3">
								<div class="flex items-center justify-between">
									<span class="font-semibold">{m.signature.name}</span>
									<code class="text-muted-foreground text-xs">{m.signature.mimeType}</code>
								</div>
								<p class="text-muted-foreground mt-1 font-mono text-xs">
									{m.bytesShown.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")}
								</p>
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	{#if error}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-sm"
		>
			{error}
		</div>
	{/if}
</main>
