<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Upload from "@lucide/svelte/icons/upload";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import { hashBytes, type HashAlgorithm, HASH_ALGORITHMS } from "$lib/hash";

	let algorithm = $state<HashAlgorithm>("SHA-256");
	let expected = $state("");
	let fileName = $state<string | null>(null);
	let fileSize = $state(0);
	let computed = $state("");
	let error = $state<string | null>(null);
	let isHashing = $state(false);
	let token = 0;

	async function processFile(file: File | undefined) {
		if (!file) return;
		const myToken = ++token;
		fileName = file.name;
		fileSize = file.size;
		computed = "";
		error = null;
		isHashing = true;
		try {
			const buf = await file.arrayBuffer();
			if (myToken !== token) return;
			const h = await hashBytes(buf, algorithm);
			if (myToken !== token) return;
			computed = h;
		} catch (e) {
			if (myToken !== token) return;
			error = (e as Error).message;
		} finally {
			if (myToken === token) isHashing = false;
		}
	}

	$effect(() => {
		void algorithm;
		// Re-hash when algorithm changes if a file was already loaded
		const inputEl = document.getElementById("hc-file") as HTMLInputElement | null;
		const file = inputEl?.files?.[0];
		if (file) processFile(file);
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		processFile(target.files?.[0]);
	}

	function normalize(h: string): string {
		return h.replace(/\s+/g, "").toLowerCase();
	}

	let match = $derived.by(() => {
		const ex = normalize(expected);
		const co = normalize(computed);
		if (!ex || !co) return null;
		return ex === co;
	});

	function clear() {
		token++;
		fileName = null;
		fileSize = 0;
		computed = "";
		error = null;
		isHashing = false;
		const inputEl = document.getElementById("hc-file") as HTMLInputElement | null;
		if (inputEl) inputEl.value = "";
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
		<h1 class="text-3xl font-bold tracking-tight">Hash Verifier</h1>
		<p class="text-muted-foreground mt-1">
			Hash a file locally and compare it to an expected checksum.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="al">Algorithm</Label>
					<Select.Root type="single" bind:value={algorithm as never}>
						<Select.Trigger id="al" class="w-full">{algorithm}</Select.Trigger>
						<Select.Content>
							{#each HASH_ALGORITHMS as a (a)}
								<Select.Item value={a}>{a}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-1.5">
					<Label for="ex">Expected hash</Label>
					<Input id="ex" bind:value={expected} class="font-mono text-xs" placeholder="hex digest" />
				</div>
			</div>

			{#if !fileName}
				<button
					type="button"
					class="hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground border-border flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 text-center transition-colors"
					onclick={() => document.getElementById("hc-file")?.click()}
				>
					<Upload class="h-10 w-10" />
					<p>Click to select a file</p>
					<input id="hc-file" type="file" onchange={handleFileSelect} class="hidden" />
				</button>
			{:else}
				<div class="bg-muted flex items-center justify-between rounded-md p-3">
					<div>
						<p class="font-mono text-sm">{fileName}</p>
						<p class="text-muted-foreground text-xs">{fileSize.toLocaleString()} bytes</p>
					</div>
					<Button variant="ghost" size="sm" onclick={clear}>Remove</Button>
				</div>
			{/if}

			{#if isHashing}
				<p class="text-muted-foreground text-sm">Hashing...</p>
			{/if}

			{#if computed}
				<div class="bg-muted rounded-md p-3">
					<p class="text-muted-foreground text-xs">Computed</p>
					<p class="font-mono text-xs break-all">{computed}</p>
				</div>
			{/if}

			{#if match !== null}
				<div class="rounded-md border p-3 {match ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-destructive/50 bg-destructive/10'}">
					<div class="flex items-center gap-2 text-sm font-semibold">
						{#if match}
							<CheckCircle class="h-5 w-5 text-emerald-500" />
							<span>Match — file matches expected hash.</span>
						{:else}
							<XCircle class="text-destructive h-5 w-5" />
							<span class="text-destructive">No match — file is different.</span>
						{/if}
					</div>
				</div>
			{/if}

			{#if error}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
