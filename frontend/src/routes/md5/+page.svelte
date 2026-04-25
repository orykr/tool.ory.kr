<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { md5, md5Text } from "$lib/md5";

	let text = $state("Hello, world!");
	let textHash = $derived(md5Text(text));

	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let fileHash = $state("");
	let fileError = $state<string | null>(null);
	let isHashing = $state(false);
	let token = 0;

	async function processFile(file: File | undefined) {
		if (!file) return;
		const myToken = ++token;
		fileName = file.name;
		fileSize = file.size;
		fileHash = "";
		fileError = null;
		isHashing = true;
		try {
			const buf = await file.arrayBuffer();
			if (myToken !== token) return;
			fileHash = md5(new Uint8Array(buf));
		} catch (e) {
			if (myToken !== token) return;
			fileError = (e as Error).message;
		} finally {
			if (myToken === token) isHashing = false;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		processFile(target.files?.[0]);
	}

	function clearFile() {
		token++;
		fileName = null;
		fileSize = 0;
		fileHash = "";
		fileError = null;
		isHashing = false;
	}

	let copied = $state<string | null>(null);
	async function copy(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copied = key;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">MD5 Hash</h1>
		<p class="text-muted-foreground mt-1">
			MD5 digest for text or files. <strong>Not cryptographically secure</strong> — use SHA-256 for
			anything sensitive.
		</p>
	</header>

	<Tabs.Root value="text">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="text">Text</Tabs.Trigger>
			<Tabs.Trigger value="file">File</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="text">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Text → MD5</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<Textarea bind:value={text} class="min-h-32 font-mono text-sm" />
					<div class="bg-muted flex items-center justify-between rounded-md p-3">
						<p class="font-mono text-xs break-all">{textHash}</p>
						<Button variant="ghost" size="sm" onclick={() => copy("t", textHash)}>
							{#if copied === "t"}<Check />Copied{:else}<Copy />Copy{/if}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="file">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">File → MD5</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					{#if !fileName}
						<button
							type="button"
							class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground border-border flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors"
							onclick={() => document.getElementById("md5-file")?.click()}
						>
							<Upload class="h-10 w-10" />
							<p>Click to select a file</p>
							<input id="md5-file" type="file" onchange={handleFileSelect} class="hidden" />
						</button>
					{:else}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<div>
								<p class="font-mono text-sm">{fileName}</p>
								<p class="text-muted-foreground text-xs">{fileSize.toLocaleString()} bytes</p>
							</div>
							<Button variant="ghost" size="sm" onclick={clearFile}>
								<Trash2 />
								Remove
							</Button>
						</div>
					{/if}
					{#if isHashing}
						<p class="text-muted-foreground text-sm">Hashing...</p>
					{/if}
					{#if fileHash}
						<div class="bg-muted flex items-center justify-between rounded-md p-3">
							<p class="font-mono text-xs break-all">{fileHash}</p>
							<Button variant="ghost" size="sm" onclick={() => copy("f", fileHash)}>
								{#if copied === "f"}<Check />Copied{:else}<Copy />Copy{/if}
							</Button>
						</div>
					{/if}
					{#if fileError}
						<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
							{fileError}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</main>
