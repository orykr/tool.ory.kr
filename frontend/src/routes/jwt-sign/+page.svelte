<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let payload = $state(`{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}`);
	let secret = $state("your-256-bit-secret");
	let algorithm = $state<"HS256" | "HS384" | "HS512">("HS256");

	const algLabels: Record<string, string> = {
		HS256: "HS256 (HMAC-SHA256)",
		HS384: "HS384 (HMAC-SHA384)",
		HS512: "HS512 (HMAC-SHA512)"
	};

	function bytesToBase64Url(bytes: Uint8Array): string {
		let binary = "";
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	}

	function utf8Base64Url(text: string): string {
		const bytes = new TextEncoder().encode(text);
		return bytesToBase64Url(bytes);
	}

	let token = $state("");
	let errorMsg = $state<string | null>(null);
	let signSeq = 0;

	async function sign(p: string, s: string, alg: "HS256" | "HS384" | "HS512", seq: number) {
		try {
			const parsed = JSON.parse(p);
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
				throw new Error("Payload must be a JSON object.");
			}
			const header = { alg, typ: "JWT" };
			const headerSeg = utf8Base64Url(JSON.stringify(header));
			const payloadSeg = utf8Base64Url(JSON.stringify(parsed));
			const data = new TextEncoder().encode(`${headerSeg}.${payloadSeg}`);
			const keyBytes = new TextEncoder().encode(s);
			const hashName = alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512";
			const key = await crypto.subtle.importKey(
				"raw",
				keyBytes,
				{ name: "HMAC", hash: hashName },
				false,
				["sign"]
			);
			const sigBuf = await crypto.subtle.sign("HMAC", key, data);
			const sigSeg = bytesToBase64Url(new Uint8Array(sigBuf));
			if (seq !== signSeq) return;
			token = `${headerSeg}.${payloadSeg}.${sigSeg}`;
			errorMsg = null;
		} catch (e) {
			if (seq !== signSeq) return;
			token = "";
			errorMsg = (e as Error).message;
		}
	}

	$effect(() => {
		const p = payload;
		const s = secret;
		const alg = algorithm;
		signSeq++;
		const mySeq = signSeq;
		if (!p.trim()) {
			token = "";
			errorMsg = null;
			return;
		}
		sign(p, s, alg, mySeq);
	});

	let copied = $state(false);
	async function copy() {
		if (!token) return;
		await navigator.clipboard.writeText(token);
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
		<h1 class="text-3xl font-bold tracking-tight">JWT Signer</h1>
		<p class="text-muted-foreground mt-1">
			Build and sign HS256 / HS384 / HS512 JWTs locally using Web Crypto. Header is fixed to <code>{`{"alg":"…","typ":"JWT"}`}</code>.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Payload (JSON)</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={payload} class="min-h-48 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Content class="grid gap-3 pt-6 sm:grid-cols-3">
			<div class="space-y-1.5 sm:col-span-2">
				<Label for="sec">Secret</Label>
				<Input id="sec" bind:value={secret} class="font-mono" />
			</div>
			<div class="space-y-1.5">
				<Label for="alg">Algorithm</Label>
				<Select.Root type="single" bind:value={algorithm as never}>
					<Select.Trigger id="alg" class="w-full">{algLabels[algorithm]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="HS256">HS256</Select.Item>
						<Select.Item value="HS384">HS384</Select.Item>
						<Select.Item value="HS512">HS512</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Token</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy} disabled={!token}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			{#if errorMsg}
				<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
					{errorMsg}
				</div>
			{:else if token}
				<Textarea value={token} readonly class="min-h-32 font-mono text-xs" />
			{:else}
				<p class="text-muted-foreground text-sm">Enter a JSON payload and a secret to sign.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
