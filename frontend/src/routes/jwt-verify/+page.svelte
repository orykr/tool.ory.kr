<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Check from "@lucide/svelte/icons/check";
	import X from "@lucide/svelte/icons/x";
	import { decodeJwt } from "$lib/jwt";

	let token = $state(
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
	);
	let secret = $state("your-256-bit-secret");
	let algorithm = $state<"HS256" | "HS384" | "HS512">("HS256");

	const algLabels: Record<string, string> = {
		HS256: "HS256 (HMAC-SHA256)",
		HS384: "HS384 (HMAC-SHA384)",
		HS512: "HS512 (HMAC-SHA512)"
	};

	function base64UrlToBytes(input: string): Uint8Array {
		const padded = input.replace(/-/g, "+").replace(/_/g, "/");
		const padLen = (4 - (padded.length % 4)) % 4;
		const binary = atob(padded + "=".repeat(padLen));
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return bytes;
	}

	function bytesToBase64Url(bytes: Uint8Array): string {
		let binary = "";
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	}

	let decoded = $derived.by(() => {
		try {
			return { ok: true as const, value: decodeJwt(token) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	let verifyResult = $state<{ status: "idle" | "ok" | "fail" | "error"; message: string }>({
		status: "idle",
		message: ""
	});
	let verifySeq = 0;

	async function verify(t: string, s: string, alg: "HS256" | "HS384" | "HS512", seq: number) {
		try {
			const parts = t.split(".");
			if (parts.length !== 3) {
				if (seq === verifySeq) verifyResult = { status: "error", message: "Token must have 3 segments." };
				return;
			}
			const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
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
			const computed = bytesToBase64Url(new Uint8Array(sigBuf));
			const provided = parts[2];

			const expectedBytes = base64UrlToBytes(computed);
			let providedBytes: Uint8Array;
			try {
				providedBytes = base64UrlToBytes(provided);
			} catch {
				providedBytes = new Uint8Array(0);
			}
			const maxLen = Math.max(expectedBytes.length, providedBytes.length);
			let diff = expectedBytes.length ^ providedBytes.length;
			for (let i = 0; i < maxLen; i++) {
				const a = i < expectedBytes.length ? expectedBytes[i] : 0;
				const b = i < providedBytes.length ? providedBytes[i] : 0;
				diff |= a ^ b;
			}
			const equal = diff === 0;
			if (seq !== verifySeq) return;
			verifyResult = equal
				? { status: "ok", message: "Signature is valid." }
				: { status: "fail", message: "Signature does NOT match." };
		} catch (e) {
			if (seq === verifySeq) verifyResult = { status: "error", message: (e as Error).message };
		}
	}

	$effect(() => {
		const t = token.trim();
		const s = secret;
		const alg = algorithm;
		verifySeq++;
		const mySeq = verifySeq;
		if (!t || !s) {
			verifyResult = { status: "idle", message: "" };
			return;
		}
		verify(t, s, alg, mySeq);
	});
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a href="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors">
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">JWT Verifier</h1>
		<p class="text-muted-foreground mt-1">
			Verify HMAC-signed JWTs (HS256/384/512) against a shared secret. Comparison is constant-time.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Token</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={token} class="min-h-32 font-mono text-sm" />
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

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Verification</Card.Title></Card.Header>
		<Card.Content>
			{#if verifyResult.status === "ok"}
				<div class="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
					<Check class="h-4 w-4" />{verifyResult.message}
				</div>
			{:else if verifyResult.status === "fail"}
				<div class="text-destructive border-destructive/50 bg-destructive/10 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
					<X class="h-4 w-4" />{verifyResult.message}
				</div>
			{:else if verifyResult.status === "error"}
				<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">
					{verifyResult.message}
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">Enter a token and secret to verify.</p>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if decoded.ok}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Header</Card.Title></Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-auto rounded p-3 font-mono text-xs">{JSON.stringify(decoded.value.header, null, 2)}</pre>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title class="text-base">Payload</Card.Title></Card.Header>
				<Card.Content>
					<pre class="bg-muted overflow-auto rounded p-3 font-mono text-xs">{JSON.stringify(decoded.value.payload, null, 2)}</pre>
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="text-destructive border-destructive/50 bg-destructive/10 rounded-md border p-3 text-sm">{decoded.error}</div>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
