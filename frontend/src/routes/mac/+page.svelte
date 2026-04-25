<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import CheckCircle from "@lucide/svelte/icons/check-circle";
	import XCircle from "@lucide/svelte/icons/x-circle";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";

	let input = $state("aa:bb:cc:dd:ee:ff");

	let result = $derived.by(() => {
		const cleaned = input.replace(/[\s\-:.]/g, "").toUpperCase();
		if (cleaned.length !== 12) {
			return { ok: false as const, error: "MAC must be 12 hex digits." };
		}
		if (!/^[0-9A-F]+$/.test(cleaned)) {
			return { ok: false as const, error: "Contains non-hex characters." };
		}
		const bytes: string[] = [];
		for (let i = 0; i < 12; i += 2) bytes.push(cleaned.slice(i, i + 2));
		const firstByte = parseInt(bytes[0], 16);
		const isMulticast = (firstByte & 0x01) === 0x01;
		const isLocal = (firstByte & 0x02) === 0x02;
		const isBroadcast = bytes.every((b) => b === "FF");
		return {
			ok: true as const,
			cleaned,
			oui: bytes.slice(0, 3).join(":"),
			nic: bytes.slice(3).join(":"),
			isMulticast,
			isLocal,
			isBroadcast,
			formats: {
				colon: bytes.join(":"),
				colonLower: bytes.join(":").toLowerCase(),
				dash: bytes.join("-"),
				dotted: `${bytes.slice(0, 2).join("")}.${bytes.slice(2, 4).join("")}.${bytes.slice(4).join("")}`,
				bare: cleaned,
				bareLower: cleaned.toLowerCase()
			}
		};
	});

	function generateRandom() {
		const buf = new Uint8Array(6);
		crypto.getRandomValues(buf);
		buf[0] = (buf[0] & 0xfe) | 0x02; // locally administered, unicast
		input = Array.from(buf)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(":");
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
		<h1 class="text-3xl font-bold tracking-tight">MAC Address Tools</h1>
		<p class="text-muted-foreground mt-1">
			Validate, format, and inspect Ethernet MAC addresses.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Address</Card.Title>
			<Button variant="outline" size="sm" onclick={generateRandom}>
				<RefreshCw />
				Random (locally administered)
			</Button>
		</Card.Header>
		<Card.Content>
			<Input bind:value={input} class="font-mono" placeholder="aa:bb:cc:dd:ee:ff or 00-11-22-33-44-55" />
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="space-y-3 pt-6">
			{#if result.ok}
				<div class="bg-muted rounded-md p-3">
					<div class="flex items-center gap-2">
						<CheckCircle class="h-5 w-5 text-emerald-500" />
						<span class="font-semibold">Valid MAC address</span>
					</div>
					<dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
						<div>
							<dt class="text-muted-foreground text-xs">OUI (vendor)</dt>
							<dd class="font-mono">{result.oui}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground text-xs">NIC</dt>
							<dd class="font-mono">{result.nic}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground text-xs">I/G bit</dt>
							<dd class="font-mono">
								{result.isMulticast ? "Multicast / Group" : "Unicast / Individual"}
							</dd>
						</div>
						<div>
							<dt class="text-muted-foreground text-xs">U/L bit</dt>
							<dd class="font-mono">
								{result.isLocal ? "Locally administered" : "Universally administered"}
							</dd>
						</div>
						{#if result.isBroadcast}
							<div class="col-span-2">
								<span class="rounded bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
									Broadcast (FF:FF:FF:FF:FF:FF)
								</span>
							</div>
						{/if}
					</dl>
				</div>

				<div class="space-y-2">
					{#each Object.entries(result.formats) as [key, value] (key)}
						<div class="bg-muted flex items-center justify-between rounded-md p-2">
							<div>
								<p class="text-muted-foreground text-xs">{key}</p>
								<p class="font-mono text-sm">{value}</p>
							</div>
							<Button variant="ghost" size="sm" onclick={() => copy(key, value)}>
								{#if copied === key}<Check />{:else}<Copy />{/if}
							</Button>
						</div>
					{/each}
				</div>
			{:else}
				<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
					<div class="flex items-center gap-2">
						<XCircle class="h-5 w-5" />
						<span class="font-semibold">{result.error}</span>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
