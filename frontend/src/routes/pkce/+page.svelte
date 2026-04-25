<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";

	let length = $state(64);
	let method = $state<"S256" | "plain">("S256");
	let codeVerifier = $state("");
	let codeChallenge = $state("");
	let stateParam = $state("");
	let nonce = $state("");
	let error = $state<string | null>(null);
	let token = 0;

	const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

	function randomVerifier(len: number): string {
		const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length;
		let out = "";
		const buf = new Uint8Array(len * 2);
		while (out.length < len) {
			crypto.getRandomValues(buf);
			for (const b of buf) {
				if (b >= limit) continue;
				out += ALPHABET[b % ALPHABET.length];
				if (out.length === len) break;
			}
		}
		return out;
	}

	function base64Url(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer);
		let bin = "";
		for (const b of bytes) bin += String.fromCharCode(b);
		return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	}

	async function compute() {
		const myToken = ++token;
		try {
			const v = randomVerifier(Math.max(43, Math.min(128, Math.floor(length))));
			const buf = new TextEncoder().encode(v);
			let challenge: string;
			if (method === "S256") {
				const digest = await crypto.subtle.digest("SHA-256", buf);
				challenge = base64Url(digest);
			} else {
				challenge = v;
			}
			if (myToken !== token) return;
			codeVerifier = v;
			codeChallenge = challenge;
			error = null;
		} catch (e) {
			if (myToken !== token) return;
			error = (e as Error).message;
		}
	}

	function regenerateState() {
		const buf = new Uint8Array(16);
		crypto.getRandomValues(buf);
		stateParam = Array.from(buf)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	function regenerateNonce() {
		const buf = new Uint8Array(16);
		crypto.getRandomValues(buf);
		nonce = Array.from(buf)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	$effect(() => {
		void length;
		void method;
		compute();
	});

	$effect(() => {
		regenerateState();
		regenerateNonce();
	});

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
		<h1 class="text-3xl font-bold tracking-tight">OAuth PKCE / State Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate <code>code_verifier</code>, <code>code_challenge</code>, <code>state</code>, and
			<code>nonce</code> for OAuth 2.0 / OIDC.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">PKCE</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="len">Verifier length (43–128)</Label>
					<Input id="len" type="number" min="43" max="128" bind:value={length} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="m">Method</Label>
					<Select.Root type="single" bind:value={method as never}>
						<Select.Trigger id="m" class="w-full">{method}</Select.Trigger>
						<Select.Content>
							<Select.Item value="S256">S256 (recommended)</Select.Item>
							<Select.Item value="plain">plain</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<Button onclick={compute}>
				<RefreshCw />
				Regenerate
			</Button>

			{#if error}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{error}
				</div>
			{/if}

			<div class="bg-muted rounded-md p-3">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-xs">code_verifier</span>
					<Button variant="ghost" size="sm" onclick={() => copy("v", codeVerifier)}>
						{#if copied === "v"}<Check />{:else}<Copy />{/if}
					</Button>
				</div>
				<p class="mt-1 font-mono text-xs break-all">{codeVerifier}</p>
			</div>
			<div class="bg-muted rounded-md p-3">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-xs">code_challenge ({method})</span>
					<Button variant="ghost" size="sm" onclick={() => copy("c", codeChallenge)}>
						{#if copied === "c"}<Check />{:else}<Copy />{/if}
					</Button>
				</div>
				<p class="mt-1 font-mono text-xs break-all">{codeChallenge}</p>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">State / Nonce</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="bg-muted rounded-md p-3">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-xs">state</span>
					<div class="flex gap-1">
						<Button variant="ghost" size="sm" onclick={regenerateState}>
							<RefreshCw />
						</Button>
						<Button variant="ghost" size="sm" onclick={() => copy("s", stateParam)}>
							{#if copied === "s"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				</div>
				<p class="mt-1 font-mono text-xs break-all">{stateParam}</p>
			</div>
			<div class="bg-muted rounded-md p-3">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-xs">nonce</span>
					<div class="flex gap-1">
						<Button variant="ghost" size="sm" onclick={regenerateNonce}>
							<RefreshCw />
						</Button>
						<Button variant="ghost" size="sm" onclick={() => copy("n", nonce)}>
							{#if copied === "n"}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				</div>
				<p class="mt-1 font-mono text-xs break-all">{nonce}</p>
			</div>
		</Card.Content>
	</Card.Root>
</main>
