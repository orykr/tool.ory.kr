<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let mode = $state<"encrypt" | "decrypt">("encrypt");
	let plaintext = $state("Sensitive message here.");
	let ciphertext = $state("");
	let password = $state("correct horse battery staple");
	let iterations = $state(200000);
	let keyBits = $state<"128" | "256">("256");

	const keyBitsLabels: Record<string, string> = {
		"128": "AES-128-GCM",
		"256": "AES-256-GCM"
	};

	let busy = $state(false);
	let errorMsg = $state<string | null>(null);
	let result = $state("");
	let copied = $state(false);

	function bytesToBase64(bytes: Uint8Array): string {
		let binary = "";
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}

	function base64ToBytes(input: string): Uint8Array {
		const cleaned = input.replace(/\s+/g, "");
		const binary = atob(cleaned);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return bytes;
	}

	async function deriveKey(passphrase: string, salt: Uint8Array, iter: number, bits: number): Promise<CryptoKey> {
		const baseKey = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(passphrase),
			{ name: "PBKDF2" },
			false,
			["deriveKey"]
		);
		return crypto.subtle.deriveKey(
			{ name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: iter, hash: "SHA-256" },
			baseKey,
			{ name: "AES-GCM", length: bits },
			false,
			["encrypt", "decrypt"]
		);
	}

	async function encrypt() {
		busy = true;
		errorMsg = null;
		try {
			const salt = crypto.getRandomValues(new Uint8Array(16));
			const iv = crypto.getRandomValues(new Uint8Array(12));
			const key = await deriveKey(password, salt, iterations, Number(keyBits));
			const data = new TextEncoder().encode(plaintext);
			const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, data);
			const cipher = new Uint8Array(cipherBuf);
			const itBytes = new Uint8Array(4);
			new DataView(itBytes.buffer).setUint32(0, iterations, false);
			const flags = new Uint8Array([Number(keyBits) === 256 ? 1 : 0]);
			const blob = new Uint8Array(1 + 4 + salt.length + iv.length + cipher.length);
			blob.set(flags, 0);
			blob.set(itBytes, 1);
			blob.set(salt, 5);
			blob.set(iv, 5 + salt.length);
			blob.set(cipher, 5 + salt.length + iv.length);
			result = bytesToBase64(blob);
		} catch (e) {
			result = "";
			errorMsg = (e as Error).message;
		} finally {
			busy = false;
		}
	}

	async function decrypt() {
		busy = true;
		errorMsg = null;
		try {
			const blob = base64ToBytes(ciphertext);
			if (blob.length < 1 + 4 + 16 + 12 + 16) throw new Error("Ciphertext too short.");
			const flags = blob[0];
			const iter = new DataView(blob.buffer, blob.byteOffset + 1, 4).getUint32(0, false);
			const salt = blob.slice(5, 5 + 16);
			const iv = blob.slice(5 + 16, 5 + 16 + 12);
			const cipher = blob.slice(5 + 16 + 12);
			const bits = (flags & 1) === 1 ? 256 : 128;
			const key = await deriveKey(password, salt, iter, bits);
			const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, cipher as unknown as BufferSource);
			result = new TextDecoder().decode(plainBuf);
		} catch (e) {
			result = "";
			errorMsg = (e as Error).message + " (wrong password or corrupted ciphertext?)";
		} finally {
			busy = false;
		}
	}

	async function copy() {
		if (!result) return;
		await navigator.clipboard.writeText(result);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">AES-GCM Encrypt / Decrypt</h1>
		<p class="text-muted-foreground mt-1">
			AES-GCM with PBKDF2-SHA256 key derivation. Salt, IV, iteration count, and key-size flag are bundled with the ciphertext (base64).
		</p>
	</header>

	<Tabs.Root value={mode} onValueChange={(v) => (mode = v as "encrypt" | "decrypt")}>
		<Tabs.List>
			<Tabs.Trigger value="encrypt">Encrypt</Tabs.Trigger>
			<Tabs.Trigger value="decrypt">Decrypt</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="encrypt">
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">Plaintext</Card.Title></Card.Header>
				<Card.Content>
					<Textarea bind:value={plaintext} class="min-h-32 font-mono text-sm" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="decrypt">
			<Card.Root class="mb-4">
				<Card.Header><Card.Title class="text-base">Ciphertext (base64)</Card.Title></Card.Header>
				<Card.Content>
					<Textarea bind:value={ciphertext} class="min-h-32 font-mono text-xs" />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5 sm:col-span-2">
				<Label for="pw">Password</Label>
				<Input id="pw" type="password" bind:value={password} />
			</div>
			<div class="space-y-1.5">
				<Label for="kb">Key size</Label>
				<Select.Root type="single" bind:value={keyBits as never}>
					<Select.Trigger id="kb" class="w-full">{keyBitsLabels[keyBits]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="128">AES-128-GCM</Select.Item>
						<Select.Item value="256">AES-256-GCM</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<Label for="it">PBKDF2 iterations</Label>
				<Input id="it" type="number" min="1000" max="2000000" step="1000" bind:value={iterations} />
			</div>
		</Card.Content>
	</Card.Root>

	<div class="mb-4 flex gap-2">
		{#if mode === "encrypt"}
			<Button onclick={encrypt} disabled={busy || !password}>Encrypt</Button>
		{:else}
			<Button onclick={decrypt} disabled={busy || !password || !ciphertext.trim()}>Decrypt</Button>
		{/if}
	</div>

	{#if errorMsg}
		<div class="text-destructive border-destructive/50 bg-destructive/10 mb-4 rounded-md border p-3 text-sm">
			{errorMsg}
		</div>
	{/if}

	{#if result}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">{mode === "encrypt" ? "Ciphertext (base64)" : "Plaintext"}</Card.Title>
				<Button variant="ghost" size="sm" onclick={copy}>
					{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<Textarea value={result} readonly class="min-h-32 font-mono text-xs" />
			</Card.Content>
		</Card.Root>
	{/if}
</main>
