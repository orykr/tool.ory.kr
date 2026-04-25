<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowDownUp from "@lucide/svelte/icons/arrow-down-up";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import {
		base32Encode,
		base32Decode,
		base58Encode,
		base58Decode,
		stringToBytes,
		bytesToString
	} from "$lib/base-extra";

	let mode = $state<"encode" | "decode">("encode");
	let input = $state("Hello, world!");
	let copied = $state<string | null>(null);

	let b32 = $derived.by(() => {
		try {
			if (mode === "encode") return base32Encode(stringToBytes(input));
			return bytesToString(base32Decode(input));
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
	});

	let b58 = $derived.by(() => {
		try {
			if (mode === "encode") return base58Encode(stringToBytes(input));
			return bytesToString(base58Decode(input));
		} catch (e) {
			return `Error: ${(e as Error).message}`;
		}
	});

	function swap() {
		mode = mode === "encode" ? "decode" : "encode";
	}

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
		<h1 class="text-3xl font-bold tracking-tight">Base32 / Base58</h1>
		<p class="text-muted-foreground mt-1">
			Encode and decode UTF-8 text using Base32 (RFC 4648) or Base58 (Bitcoin alphabet).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">{mode === "encode" ? "Encode text" : "Decode to text"}</Card.Title>
			<Button variant="outline" size="sm" onclick={swap}>
				<ArrowDownUp />
				Swap
			</Button>
		</Card.Header>
		<Card.Content>
			<Textarea bind:value={input} class="min-h-32 font-mono text-sm" />
		</Card.Content>
	</Card.Root>

	<div class="grid gap-3 md:grid-cols-2">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Base32</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => copy("b32", b32)}>
					{#if copied === "b32"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{b32}</pre>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Base58</Card.Title>
				<Button variant="ghost" size="sm" onclick={() => copy("b58", b58)}>
					{#if copied === "b58"}<Check />Copied{:else}<Copy />Copy{/if}
				</Button>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{b58}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
