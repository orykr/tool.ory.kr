<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { decodeJwt, describeTimeClaim, type JwtParts } from "$lib/jwt";

	let token = $state("");
	let result = $state<JwtParts | null>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		if (!token.trim()) {
			result = null;
			error = null;
			return;
		}
		try {
			result = decodeJwt(token);
			error = null;
		} catch (e) {
			result = null;
			error = (e as Error).message;
		}
	});

	const timeClaims = ["iat", "exp", "nbf", "auth_time"];

	function annotated(payload: unknown): Array<{ key: string; value: string; hint?: string }> {
		if (!payload || typeof payload !== "object") return [];
		return Object.entries(payload as Record<string, unknown>).map(([key, value]) => {
			const formatted =
				typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
			const hint = timeClaims.includes(key) ? describeTimeClaim(value) ?? undefined : undefined;
			return { key, value: formatted, hint };
		});
	}

	let payloadEntries = $derived(result ? annotated(result.payload) : []);

	let copyState = $state<{ key: string | null }>({ key: null });

	async function copyValue(key: string, value: string) {
		await navigator.clipboard.writeText(value);
		copyState.key = key;
		setTimeout(() => (copyState.key = null), 1500);
	}

	function clear() {
		token = "";
	}

	function loadSample() {
		token =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
			"eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9yeSBVc2VyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9." +
			"sample-signature";
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">JWT Decoder</h1>
		<p class="text-muted-foreground mt-1">
			Inspect a JSON Web Token's header and payload locally. The signature is not verified.
		</p>
	</header>

	<Card.Root class="mb-6">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Token</Card.Title>
			<div class="flex gap-2">
				<Button variant="ghost" size="sm" onclick={loadSample}>Sample</Button>
				<Button variant="ghost" size="sm" onclick={clear} disabled={!token}>
					<Trash2 />
					Clear
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<Textarea
				bind:value={token}
				placeholder="Paste a JWT (header.payload.signature)..."
				class="min-h-32 font-mono text-sm break-all"
			/>
			{#if error}
				<div
					class="border-destructive/50 bg-destructive/10 text-destructive mt-3 rounded-md border p-3 text-sm"
				>
					{error}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if result}
		<div class="grid gap-4 md:grid-cols-2">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Header</Card.Title>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => copyValue("header", JSON.stringify(result?.header, null, 2))}
					>
						{#if copyState.key === "header"}
							<Check />
							Copied
						{:else}
							<Copy />
							Copy
						{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre
						class="bg-muted overflow-x-auto rounded-md p-3 text-xs">{JSON.stringify(
							result.header,
							null,
							2
						)}</pre>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Payload</Card.Title>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => copyValue("payload", JSON.stringify(result?.payload, null, 2))}
					>
						{#if copyState.key === "payload"}
							<Check />
							Copied
						{:else}
							<Copy />
							Copy
						{/if}
					</Button>
				</Card.Header>
				<Card.Content>
					<pre
						class="bg-muted overflow-x-auto rounded-md p-3 text-xs">{JSON.stringify(
							result.payload,
							null,
							2
						)}</pre>
				</Card.Content>
			</Card.Root>
		</div>

		{#if payloadEntries.length}
			<Card.Root class="mt-4">
				<Card.Header>
					<Card.Title class="text-base">Claims</Card.Title>
					<Card.Description>Time fields are interpreted as Unix epoch seconds.</Card.Description>
				</Card.Header>
				<Card.Content>
					<dl class="divide-y">
						{#each payloadEntries as entry (entry.key)}
							<div class="grid grid-cols-3 gap-4 py-2 text-sm">
								<dt class="font-mono font-medium">{entry.key}</dt>
								<dd class="col-span-2 break-all">
									<span class="font-mono">{entry.value}</span>
									{#if entry.hint}
										<span class="text-muted-foreground ml-2 text-xs">→ {entry.hint}</span>
									{/if}
								</dd>
							</div>
						{/each}
					</dl>
				</Card.Content>
			</Card.Root>
		{/if}

		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title class="text-base">Signature</Card.Title>
				<Card.Description>
					Raw signature segment (Base64URL). Verification requires the signing key.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="bg-muted rounded-md p-3 font-mono text-xs break-all">{result.signature}</p>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
