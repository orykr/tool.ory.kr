<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	let bytes = $state(32);
	let counter = $state(0);

	function generateBytes(n: number): Uint8Array {
		const buf = new Uint8Array(Math.max(1, Math.min(8192, Math.floor(n) || 32)));
		crypto.getRandomValues(buf);
		return buf;
	}

	let data = $derived.by(() => {
		void counter;
		void bytes;
		const buf = generateBytes(bytes);
		const hex = Array.from(buf)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		const upperHex = hex.toUpperCase();
		const colonHex = hex.match(/.{1,2}/g)?.join(":") ?? "";
		const cFmt = "{ " + Array.from(buf).map((b) => `0x${b.toString(16).padStart(2, "0")}`).join(", ") + " }";

		// base64
		let bin = "";
		for (const b of buf) bin += String.fromCharCode(b);
		const b64 = btoa(bin);
		const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

		// integers
		let asBigInt = 0n;
		for (const b of buf) asBigInt = (asBigInt << 8n) | BigInt(b);

		return { hex, upperHex, colonHex, cFmt, b64, b64url, asBigInt: asBigInt.toString() };
	});

	function regenerate() {
		counter++;
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
		<h1 class="text-3xl font-bold tracking-tight">Random Bytes Generator</h1>
		<p class="text-muted-foreground mt-1">
			Generate cryptographically random bytes in hex, base64, base64url, and other formats.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Settings</Card.Title></Card.Header>
		<Card.Content class="flex items-end gap-3">
			<div class="flex-1 space-y-1.5">
				<Label for="b">Bytes (1–8192)</Label>
				<Input id="b" type="number" min="1" max="8192" bind:value={bytes} class="font-mono" />
			</div>
			<Button onclick={regenerate}>
				<RefreshCw />
				Regenerate
			</Button>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Output</Card.Title></Card.Header>
		<Card.Content>
			<dl class="space-y-2">
				{#each [
					{ k: "Hex (lowercase)", v: data.hex, key: "h" },
					{ k: "Hex (uppercase)", v: data.upperHex, key: "u" },
					{ k: "Hex (colon-separated)", v: data.colonHex, key: "c" },
					{ k: "C array", v: data.cFmt, key: "ca" },
					{ k: "Base64", v: data.b64, key: "b" },
					{ k: "Base64 URL-safe", v: data.b64url, key: "bu" },
					{ k: "Integer (BigInt)", v: data.asBigInt, key: "i" }
				] as item (item.key)}
					<div class="bg-muted flex items-center justify-between gap-3 rounded-md p-3">
						<div class="min-w-0 flex-1">
							<p class="text-muted-foreground text-xs">{item.k}</p>
							<p class="font-mono text-xs break-all">{item.v}</p>
						</div>
						<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
							{#if copied === item.key}<Check />{:else}<Copy />{/if}
						</Button>
					</div>
				{/each}
			</dl>
		</Card.Content>
	</Card.Root>
</main>
