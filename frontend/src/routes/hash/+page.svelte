<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Upload from "@lucide/svelte/icons/upload";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { hashText, hashBytes, HASH_ALGORITHMS, type HashAlgorithm } from "$lib/hash";

	let text = $state("");
	let textHashes = $state<Record<HashAlgorithm, string>>({
		"SHA-1": "",
		"SHA-256": "",
		"SHA-384": "",
		"SHA-512": ""
	});
	let textError = $state<string | null>(null);
	let textCopied = $state<HashAlgorithm | null>(null);
	let textToken = 0;

	$effect(() => {
		const value = text;
		const myToken = ++textToken;
		if (!value) {
			textHashes = { "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" };
			textError = null;
			return;
		}
		(async () => {
			try {
				const entries = await Promise.all(
					HASH_ALGORITHMS.map(async (algo) => [algo, await hashText(value, algo)] as const)
				);
				if (myToken !== textToken) return;
				textHashes = Object.fromEntries(entries) as Record<HashAlgorithm, string>;
				textError = null;
			} catch (e) {
				if (myToken !== textToken) return;
				textError = (e as Error).message;
			}
		})();
	});

	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let fileHashes = $state<Record<HashAlgorithm, string>>({
		"SHA-1": "",
		"SHA-256": "",
		"SHA-384": "",
		"SHA-512": ""
	});
	let fileError = $state<string | null>(null);
	let fileCopied = $state<HashAlgorithm | null>(null);
	let isHashing = $state(false);
	let isDragging = $state(false);
	let fileToken = 0;

	async function processFile(file: File | undefined) {
		if (!file) return;
		const myToken = ++fileToken;
		fileError = null;
		fileName = file.name;
		fileSize = file.size;
		fileHashes = { "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" };
		isHashing = true;
		try {
			const buf = await file.arrayBuffer();
			if (myToken !== fileToken) return;
			const entries = await Promise.all(
				HASH_ALGORITHMS.map(async (algo) => [algo, await hashBytes(buf, algo)] as const)
			);
			if (myToken !== fileToken) return;
			fileHashes = Object.fromEntries(entries) as Record<HashAlgorithm, string>;
		} catch (e) {
			if (myToken !== fileToken) return;
			fileError = (e as Error).message;
		} finally {
			if (myToken === fileToken) isHashing = false;
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

	function clearFile() {
		fileToken++;
		fileName = null;
		fileSize = 0;
		fileHashes = { "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" };
		fileError = null;
		isHashing = false;
	}

	async function copyText(algo: HashAlgorithm) {
		await navigator.clipboard.writeText(textHashes[algo]);
		textCopied = algo;
		setTimeout(() => (textCopied = null), 1500);
	}

	async function copyFile(algo: HashAlgorithm) {
		await navigator.clipboard.writeText(fileHashes[algo]);
		fileCopied = algo;
		setTimeout(() => (fileCopied = null), 1500);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Hash Generator</h1>
		<p class="text-muted-foreground mt-1">
			Compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes via the Web Crypto API.
		</p>
	</header>

	<Tabs.Root value="text" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="text">Text</Tabs.Trigger>
			<Tabs.Trigger value="file">File</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Hash Text</Card.Title>
					<Card.Description>UTF-8 encoded before hashing.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label for="hash-text-input">Input</Label>
						<Textarea
							id="hash-text-input"
							bind:value={text}
							placeholder="Type or paste text..."
							class="min-h-32 font-mono text-sm"
						/>
					</div>

					<dl class="space-y-2">
						{#each HASH_ALGORITHMS as algo (algo)}
							<div class="bg-muted rounded-md p-3">
								<div class="flex items-center justify-between">
									<dt class="text-sm font-semibold">{algo}</dt>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => copyText(algo)}
										disabled={!textHashes[algo]}
									>
										{#if textCopied === algo}
											<Check />
											Copied
										{:else}
											<Copy />
											Copy
										{/if}
									</Button>
								</div>
								<dd class="mt-1 font-mono text-xs break-all">
									{textHashes[algo] || "—"}
								</dd>
							</div>
						{/each}
					</dl>

					{#if textError}
						<div
							class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
						>
							{textError}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="file">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Hash File</Card.Title>
					<Card.Description>Computes all four digests in one pass.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if !fileName}
						<button
							type="button"
							class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
								? 'border-primary bg-primary/5 text-primary'
								: 'border-border'}"
							onclick={() => document.getElementById("hash-file-input")?.click()}
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
						>
							<Upload class="h-10 w-10" />
							<p class="text-base font-medium">Click or Drag & Drop a file here</p>
							<input
								id="hash-file-input"
								type="file"
								onchange={handleFileSelect}
								class="hidden"
							/>
						</button>
					{:else}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<div class="min-w-0">
								<p class="truncate text-sm font-medium">{fileName}</p>
								<p class="text-muted-foreground text-xs">{formatSize(fileSize)}</p>
							</div>
							<Button variant="ghost" size="sm" onclick={clearFile}>
								<Trash2 />
								Remove
							</Button>
						</div>

						{#if isHashing}
							<p class="text-muted-foreground text-sm">Hashing...</p>
						{/if}

						<dl class="space-y-2">
							{#each HASH_ALGORITHMS as algo (algo)}
								<div class="bg-muted rounded-md p-3">
									<div class="flex items-center justify-between">
										<dt class="text-sm font-semibold">{algo}</dt>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => copyFile(algo)}
											disabled={!fileHashes[algo]}
										>
											{#if fileCopied === algo}
												<Check />
												Copied
											{:else}
												<Copy />
												Copy
											{/if}
										</Button>
									</div>
									<dd class="mt-1 font-mono text-xs break-all">
										{fileHashes[algo] || "—"}
									</dd>
								</div>
							{/each}
						</dl>
					{/if}

					{#if fileError}
						<div
							class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
						>
							{fileError}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
