<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Upload from "@lucide/svelte/icons/upload";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { encodeBase64, decodeBase64, bytesToBase64 } from "$lib/base64";

	let input = $state("");
	let output = $state("");
	let textError = $state<string | null>(null);
	let textCopied = $state(false);

	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let fileBase64 = $state("");
	let fileError = $state<string | null>(null);
	let fileCopied = $state(false);
	let isProcessing = $state(false);
	let isDragging = $state(false);
	let fileToken = 0;

	let mode = $state<"encode" | "decode">("encode");

	function process() {
		textError = null;
		if (!input) {
			output = "";
			return;
		}
		try {
			output = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
		} catch (e) {
			output = "";
			textError = mode === "encode" ? "Failed to encode." : "Invalid Base64 input.";
		}
	}

	$effect(() => {
		void input;
		void mode;
		process();
	});

	function swapMode() {
		mode = mode === "encode" ? "decode" : "encode";
		if (output) {
			input = output;
		}
	}

	async function copyText() {
		if (!output) return;
		await navigator.clipboard.writeText(output);
		textCopied = true;
		setTimeout(() => (textCopied = false), 1500);
	}

	function clearText() {
		input = "";
		output = "";
		textError = null;
	}

	async function handleFile(file: File | undefined) {
		if (!file) return;
		const token = ++fileToken;
		fileError = null;
		fileBase64 = "";
		fileName = file.name;
		fileSize = file.size;
		isProcessing = true;
		try {
			const buf = await file.arrayBuffer();
			if (token !== fileToken) return;
			fileBase64 = bytesToBase64(new Uint8Array(buf));
		} catch (e) {
			if (token !== fileToken) return;
			fileError = "Failed to read file.";
			fileBase64 = "";
		} finally {
			if (token === fileToken) isProcessing = false;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		handleFile(target.files?.[0]);
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
		handleFile(e.dataTransfer?.files[0]);
	}

	async function copyFileBase64() {
		if (!fileBase64) return;
		await navigator.clipboard.writeText(fileBase64);
		fileCopied = true;
		setTimeout(() => (fileCopied = false), 1500);
	}

	function downloadFileBase64() {
		if (!fileBase64) return;
		const blob = new Blob([fileBase64], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${fileName ?? "encoded"}.base64.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function clearFile() {
		fileToken++;
		fileName = null;
		fileSize = 0;
		fileBase64 = "";
		fileError = null;
		isProcessing = false;
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
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
		<h1 class="text-3xl font-bold tracking-tight">Base64 Encoder / Decoder</h1>
		<p class="text-muted-foreground mt-1">
			Encode and decode Base64 text or files entirely in your browser.
		</p>
	</header>

	<Tabs.Root value="text" class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="text">Text</Tabs.Trigger>
			<Tabs.Trigger value="file">File</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between gap-4">
					<div>
						<Card.Title class="text-base">
							{mode === "encode" ? "Text → Base64" : "Base64 → Text"}
						</Card.Title>
						<Card.Description>
							{mode === "encode"
								? "UTF-8 strings are encoded safely."
								: "Whitespace is ignored."}
						</Card.Description>
					</div>
					<Button variant="outline" size="sm" onclick={swapMode}>
						<ArrowDownUp />
						Swap
					</Button>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1.5">
						<Label for="b64-input">
							{mode === "encode" ? "Plain Text" : "Base64"}
						</Label>
						<Textarea
							id="b64-input"
							bind:value={input}
							placeholder={mode === "encode" ? "Type or paste text..." : "Paste Base64..."}
							class="min-h-32 font-mono text-sm"
						/>
					</div>

					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<Label for="b64-output">
								{mode === "encode" ? "Base64" : "Plain Text"}
							</Label>
							<div class="flex gap-1">
								<Button variant="ghost" size="sm" onclick={copyText} disabled={!output}>
									{#if textCopied}
										<Check />
										Copied
									{:else}
										<Copy />
										Copy
									{/if}
								</Button>
								<Button variant="ghost" size="sm" onclick={clearText} disabled={!input}>
									<Trash2 />
									Clear
								</Button>
							</div>
						</div>
						<Textarea
							id="b64-output"
							value={output}
							readonly
							placeholder="Result..."
							class="min-h-32 font-mono text-sm"
						/>
					</div>

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
					<Card.Title class="text-base">File → Base64</Card.Title>
					<Card.Description>Upload a file to get its Base64 representation.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if !fileName}
						<button
							type="button"
							class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors {isDragging
								? 'border-primary bg-primary/5 text-primary'
								: 'border-border'}"
							onclick={() => document.getElementById("file-b64-input")?.click()}
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
						>
							<Upload class="h-10 w-10" />
							<p class="text-base font-medium">Click or Drag & Drop a file here</p>
							<input
								id="file-b64-input"
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

						{#if isProcessing}
							<p class="text-muted-foreground text-sm">Encoding...</p>
						{:else if fileBase64}
							<div class="space-y-1.5">
								<div class="flex items-center justify-between">
									<Label for="file-b64-output">Base64</Label>
									<div class="flex gap-1">
										<Button variant="ghost" size="sm" onclick={copyFileBase64}>
											{#if fileCopied}
												<Check />
												Copied
											{:else}
												<Copy />
												Copy
											{/if}
										</Button>
										<Button variant="ghost" size="sm" onclick={downloadFileBase64}>
											Download
										</Button>
									</div>
								</div>
								<Textarea
									id="file-b64-output"
									value={fileBase64}
									readonly
									class="min-h-40 font-mono text-xs"
								/>
								<p class="text-muted-foreground text-xs">
									Encoded length: {fileBase64.length.toLocaleString()} characters
								</p>
							</div>
						{/if}
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
