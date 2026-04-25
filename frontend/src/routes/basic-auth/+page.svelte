<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { encodeBase64, decodeBase64 } from "$lib/base64";

	let username = $state("admin");
	let password = $state("s3cret");

	let encoded = $derived.by(() => {
		try {
			return encodeBase64(`${username}:${password}`);
		} catch (e) {
			return "(error)";
		}
	});

	let header = $derived(`Authorization: Basic ${encoded}`);
	let curlSnippet = $derived(`curl -u '${username.replace(/'/g, "'\\''")}:${password.replace(/'/g, "'\\''")}' https://example.com/api`);
	let urlAuth = $derived(`https://${encodeURIComponent(username)}:${encodeURIComponent(password)}@example.com/api`);

	let decodeInput = $state("YWRtaW46czNjcmV0");
	let decoded = $derived.by(() => {
		try {
			const text = decodeBase64(decodeInput.replace(/^\s*Basic\s+/i, ""));
			const colon = text.indexOf(":");
			if (colon === -1) return { ok: false as const, error: "Decoded string has no ':' separator." };
			return { ok: true as const, user: text.slice(0, colon), pass: text.slice(colon + 1) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
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
		<h1 class="text-3xl font-bold tracking-tight">HTTP Basic Auth</h1>
		<p class="text-muted-foreground mt-1">
			Build and decode HTTP Basic <code>Authorization</code> headers.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Build</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="space-y-1.5">
					<Label for="u">Username</Label>
					<Input id="u" bind:value={username} class="font-mono" />
				</div>
				<div class="space-y-1.5">
					<Label for="p">Password</Label>
					<Input id="p" bind:value={password} class="font-mono" />
				</div>
			</div>

			{#each [
				{ k: "Base64 token", v: encoded, key: "t" },
				{ k: "Authorization header", v: header, key: "h" },
				{ k: "curl command", v: curlSnippet, key: "c" },
				{ k: "URL with embedded credentials", v: urlAuth, key: "u" }
			] as item (item.key)}
				<div class="bg-muted flex items-center justify-between gap-3 rounded-md p-3">
					<div class="min-w-0 flex-1">
						<p class="text-muted-foreground text-xs">{item.k}</p>
						<p class="font-mono text-sm break-all">{item.v}</p>
					</div>
					<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
						{#if copied === item.key}<Check />{:else}<Copy />{/if}
					</Button>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Decode</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<div class="space-y-1.5">
				<Label for="dc">Base64 token (or full Authorization header)</Label>
				<Input id="dc" bind:value={decodeInput} class="font-mono" />
			</div>
			{#if decoded.ok}
				<div class="bg-muted grid grid-cols-2 gap-3 rounded-md p-3 text-sm">
					<div><dt class="text-muted-foreground text-xs">User</dt><dd class="font-mono break-all">{decoded.user}</dd></div>
					<div><dt class="text-muted-foreground text-xs">Pass</dt><dd class="font-mono break-all">{decoded.pass}</dd></div>
				</div>
			{:else}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					{decoded.error}
				</div>
			{/if}
			<p class="text-muted-foreground text-xs">
				Basic auth is only safe over HTTPS — credentials are not encrypted, only base64-encoded.
			</p>
		</Card.Content>
	</Card.Root>
</main>
