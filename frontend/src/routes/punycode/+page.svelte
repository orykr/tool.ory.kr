<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { encodeIdn, decodeIdn } from "$lib/punycode";

	let mode = $state<"encode" | "decode">("encode");
	let input = $state("한국어.com");
	let result = $derived.by<{ ok: true; value: string } | { ok: false; error: string }>(() => {
		try {
			return {
				ok: true,
				value: mode === "encode" ? encodeIdn(input) : decodeIdn(input)
			};
		} catch (e) {
			return { ok: false, error: (e as Error).message };
		}
	});

	function swap() {
		if (result.ok) {
			input = result.value;
			mode = mode === "encode" ? "decode" : "encode";
		}
	}

	let copied = $state(false);
	async function copyOut() {
		if (!result.ok) return;
		await navigator.clipboard.writeText(result.value);
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">Punycode / IDN</h1>
		<p class="text-muted-foreground mt-1">
			Convert internationalized domain names to and from Punycode (xn-- form).
		</p>
	</header>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">{mode === "encode" ? "Unicode → ASCII" : "ASCII → Unicode"}</Card.Title>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-1.5">
				<Label for="puny-in">{mode === "encode" ? "Domain" : "Punycode"}</Label>
				<Input id="puny-in" bind:value={input} class="font-mono" />
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<Label>Result</Label>
					<Button variant="ghost" size="sm" onclick={copyOut} disabled={!result.ok || !result.value}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				</div>
				{#if result.ok}
					<p class="bg-muted rounded-md p-3 font-mono text-sm break-all">{result.value || "—"}</p>
				{:else}
					<div
						class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
					>
						{result.error}
					</div>
				{/if}
			</div>

			<p class="text-muted-foreground text-xs">
				Each label is encoded independently. ASCII-only labels pass through; Unicode labels get the
				<code>xn--</code> prefix.
			</p>
		</Card.Content>
	</Card.Root>
</main>
