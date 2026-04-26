<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	type Format = "gzip" | "deflate" | "deflate-raw";

	const formatLabels: Record<Format, string> = {
		gzip: "gzip",
		deflate: "deflate (zlib)",
		"deflate-raw": "deflate-raw (no header)"
	};

	let mode = $state<"compress" | "decompress">("compress");
	let format = $state<Format>("gzip");

	let plaintext = $state(
		"Once upon a time there was a developer who needed to know whether gzip would be a good fit for their payload. They could now find out — instantly, in the browser, without sending the data anywhere."
	);
	let cipherInput = $state("");

	let busy = $state(false);
	let errorMsg = $state<string | null>(null);
	let result = $state<{ text: string; bytes: number; original: number } | null>(null);
	let runSeq = 0;

	function bytesToBase64(bytes: Uint8Array): string {
		let binary = "";
		const chunk = 0x8000;
		for (let i = 0; i < bytes.length; i += chunk) {
			binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
		}
		return btoa(binary);
	}

	function base64ToBytes(input: string): Uint8Array {
		const cleaned = input.replace(/\s+/g, "");
		if (!/^[A-Za-z0-9+/=]*$/.test(cleaned)) throw new Error("Input is not valid base64.");
		const binary = atob(cleaned);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return bytes;
	}

	async function streamThrough(
		bytes: Uint8Array,
		stream: ReadableWritablePair<Uint8Array, Uint8Array>
	): Promise<Uint8Array> {
		const blob = new Blob([bytes as unknown as BlobPart]);
		const piped = blob.stream().pipeThrough(stream as unknown as ReadableWritablePair);
		const buf = await new Response(piped).arrayBuffer();
		return new Uint8Array(buf);
	}

	async function runCompress() {
		runSeq++;
		const seq = runSeq;
		busy = true;
		errorMsg = null;
		try {
			const original = new TextEncoder().encode(plaintext);
			const out = await streamThrough(original, new CompressionStream(format));
			if (seq !== runSeq) return;
			result = { text: bytesToBase64(out), bytes: out.length, original: original.length };
		} catch (e) {
			if (seq !== runSeq) return;
			result = null;
			errorMsg = (e as Error).message;
		} finally {
			if (seq === runSeq) busy = false;
		}
	}

	async function runDecompress() {
		runSeq++;
		const seq = runSeq;
		busy = true;
		errorMsg = null;
		try {
			const cipher = base64ToBytes(cipherInput);
			let out: Uint8Array;
			try {
				out = await streamThrough(cipher, new DecompressionStream(format));
			} catch {
				throw new Error(`Could not decompress as ${formatLabels[format]} (wrong format or corrupt input).`);
			}
			if (seq !== runSeq) return;
			let text: string;
			try {
				text = new TextDecoder("utf-8", { fatal: true }).decode(out);
			} catch {
				throw new Error("Decompressed bytes are not valid UTF-8 text.");
			}
			result = { text, bytes: out.length, original: cipher.length };
		} catch (e) {
			if (seq !== runSeq) return;
			result = null;
			errorMsg = (e as Error).message;
		} finally {
			if (seq === runSeq) busy = false;
		}
	}

	function onTabChange(v: string) {
		mode = v as "compress" | "decompress";
		result = null;
		errorMsg = null;
	}

	function formatSize(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
		return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
	}

	let copied = $state(false);
	async function copy() {
		if (!result?.text) return;
		await navigator.clipboard.writeText(result.text);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">String Compression</h1>
		<p class="text-muted-foreground mt-1">
			Compress / decompress UTF-8 text using the browser's native <code>CompressionStream</code> (gzip, deflate, deflate-raw). Output is base64-encoded.
		</p>
	</header>

	<Tabs.Root value={mode} onValueChange={onTabChange}>
		<Tabs.List>
			<Tabs.Trigger value="compress">Compress</Tabs.Trigger>
			<Tabs.Trigger value="decompress">Decompress</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="compress">
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">Plaintext</Card.Title></Card.Header>
				<Card.Content>
					<Textarea bind:value={plaintext} class="min-h-40 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="decompress">
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">Compressed (base64)</Card.Title></Card.Header>
				<Card.Content>
					<Textarea bind:value={cipherInput} class="min-h-40 font-mono text-xs" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="fmt">Format</Label>
				<Select.Root type="single" bind:value={format as never}>
					<Select.Trigger id="fmt" class="w-full">{formatLabels[format]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="gzip">gzip</Select.Item>
						<Select.Item value="deflate">deflate (zlib)</Select.Item>
						<Select.Item value="deflate-raw">deflate-raw (no header)</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex items-end">
				{#if mode === "compress"}
					<Button onclick={runCompress} disabled={busy || !plaintext}>Compress</Button>
				{:else}
					<Button onclick={runDecompress} disabled={busy || !cipherInput.trim()}>Decompress</Button>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	{#if errorMsg}
		<div class="text-destructive border-destructive/50 bg-destructive/10 mb-4 rounded-md border p-3 text-sm">
			{errorMsg}
		</div>
	{/if}

	{#if result}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title class="text-base">{mode === "compress" ? "Compressed (base64)" : "Plaintext"}</Card.Title>
					<Card.Description>
						{#if mode === "compress"}
							{formatSize(result.original)} → {formatSize(result.bytes)} (ratio
							{(result.bytes / Math.max(1, result.original)).toFixed(3)},
							saved {(100 - (result.bytes / Math.max(1, result.original)) * 100).toFixed(1)}%)
						{:else}
							{formatSize(result.original)} → {formatSize(result.bytes)}
							(expansion ×{(result.bytes / Math.max(1, result.original)).toFixed(2)})
						{/if}
					</Card.Description>
				</div>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={result.text} readonly class="min-h-40 font-mono text-xs" />
			</Card.Content>
		</Card.Root>
	{/if}
</main>
