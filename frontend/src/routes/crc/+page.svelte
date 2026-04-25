<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { crc32, adler32, fnv1a32, djb2, toHex } from "$lib/checksum";

	let text = $state("Hello, world!");
	let textHashes = $derived.by(() => {
		const bytes = new TextEncoder().encode(text);
		return {
			crc32: crc32(bytes),
			adler32: adler32(bytes),
			fnv: fnv1a32(bytes),
			djb2: djb2(bytes)
		};
	});

	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let fileHashes = $state<{
		crc32: number;
		adler32: number;
		fnv: number;
		djb2: number;
	} | null>(null);
	let isHashing = $state(false);
	let token = 0;

	async function processFile(file: File | undefined) {
		if (!file) return;
		const myToken = ++token;
		fileName = file.name;
		fileSize = file.size;
		fileHashes = null;
		isHashing = true;
		try {
			const buf = await file.arrayBuffer();
			if (myToken !== token) return;
			const bytes = new Uint8Array(buf);
			fileHashes = {
				crc32: crc32(bytes),
				adler32: adler32(bytes),
				fnv: fnv1a32(bytes),
				djb2: djb2(bytes)
			};
		} finally {
			if (myToken === token) isHashing = false;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		processFile(target.files?.[0]);
	}

	function clear() {
		token++;
		fileName = null;
		fileSize = 0;
		fileHashes = null;
		isHashing = false;
	}

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
	}

	function row(label: string, value: number, key: string) {
		return { label, hex: toHex(value), dec: value.toString(), key };
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
		<h1 class="text-3xl font-bold tracking-tight">Checksum Tools</h1>
		<p class="text-muted-foreground mt-1">
			CRC-32, Adler-32, FNV-1a, and DJB2 hashes (non-cryptographic) for text or files.
		</p>
	</header>

	<Tabs.Root value="text">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="text">Text</Tabs.Trigger>
			<Tabs.Trigger value="file">File</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Text input</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Textarea bind:value={text} class="min-h-32 font-mono text-sm" />
					<dl class="space-y-2">
						{#each [
							row("CRC-32", textHashes.crc32, "c"),
							row("Adler-32", textHashes.adler32, "a"),
							row("FNV-1a (32-bit)", textHashes.fnv, "f"),
							row("DJB2", textHashes.djb2, "d")
						] as item (item.key)}
							<div class="bg-muted rounded-md p-3">
								<div class="flex items-center justify-between">
									<dt class="text-sm font-semibold">{item.label}</dt>
									<Button variant="ghost" size="sm" onclick={() => copy(item.key, "0x" + item.hex)}>
										{#if copied === item.key}<Check />Copied{:else}<Copy />Copy{/if}
									</Button>
								</div>
								<dd class="mt-1 font-mono text-xs">
									0x{item.hex}
									<span class="text-muted-foreground ml-2">({item.dec})</span>
								</dd>
							</div>
						{/each}
					</dl>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="file">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">File input</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					{#if !fileName}
						<button
							type="button"
							class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground border-border flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors"
							onclick={() => document.getElementById("crc-file")?.click()}
						>
							<Upload class="h-10 w-10" />
							<p>Click to select a file</p>
							<input id="crc-file" type="file" onchange={handleFileSelect} class="hidden" />
						</button>
					{:else}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<div>
								<p class="font-mono text-sm">{fileName}</p>
								<p class="text-muted-foreground text-xs">{fileSize.toLocaleString()} bytes</p>
							</div>
							<Button variant="ghost" size="sm" onclick={clear}>
								<Trash2 />
								Remove
							</Button>
						</div>
					{/if}
					{#if isHashing}
						<p class="text-muted-foreground text-sm">Hashing...</p>
					{/if}
					{#if fileHashes}
						<dl class="space-y-2">
							{#each [
								row("CRC-32", fileHashes.crc32, "fc"),
								row("Adler-32", fileHashes.adler32, "fa"),
								row("FNV-1a (32-bit)", fileHashes.fnv, "ff"),
								row("DJB2", fileHashes.djb2, "fd")
							] as item (item.key)}
								<div class="bg-muted rounded-md p-3">
									<div class="flex items-center justify-between">
										<dt class="text-sm font-semibold">{item.label}</dt>
										<Button variant="ghost" size="sm" onclick={() => copy(item.key, "0x" + item.hex)}>
											{#if copied === item.key}<Check />Copied{:else}<Copy />Copy{/if}
										</Button>
									</div>
									<dd class="mt-1 font-mono text-xs">
										0x{item.hex}
										<span class="text-muted-foreground ml-2">({item.dec})</span>
									</dd>
								</div>
							{/each}
						</dl>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
