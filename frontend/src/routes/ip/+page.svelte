<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { inspectIp } from "$lib/ip";

	let input = $state("192.168.1.42");

	let result = $derived.by(() => {
		try {
			return { ok: true as const, info: inspectIp(input) };
		} catch (e) {
			return { ok: false as const, error: (e as Error).message };
		}
	});

	const samples = [
		"192.168.1.42",
		"10.0.0.1",
		"127.0.0.1",
		"8.8.8.8",
		"::1",
		"2001:db8::1",
		"fe80::1",
		"ff02::1"
	];

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
		<h1 class="text-3xl font-bold tracking-tight">IP Address Inspector</h1>
		<p class="text-muted-foreground mt-1">
			Validate and decode IPv4 / IPv6 addresses (canonical form, hex, binary, classification).
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Input</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			<Input bind:value={input} class="font-mono" placeholder="192.168.0.1 or 2001:db8::1" />
			<div class="flex flex-wrap gap-1">
				{#each samples as s (s)}
					<button
						type="button"
						class="bg-background hover:bg-muted rounded border px-2 py-0.5 font-mono text-xs"
						onclick={() => (input = s)}
					>
						{s}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{#if result.ok}
		{@const info = result.info}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">IPv{info.version} · {info.classification}</Card.Title>
			</Card.Header>
			<Card.Content>
				<dl class="divide-y">
					{#each [
						{ k: "Canonical", v: info.canonical, key: "c" },
						{ k: "Hex", v: info.hex, key: "h" },
						{ k: "Decimal", v: info.decimal, key: "d" },
						{ k: "Binary", v: info.binary, key: "b" }
					] as item, i (i)}
						<div class="flex items-center justify-between gap-3 py-2">
							<dt class="text-muted-foreground text-sm">{item.k}</dt>
							<div class="flex items-center gap-1">
								<dd class="font-mono text-sm break-all">{item.v}</dd>
								<Button variant="ghost" size="sm" onclick={() => copy(item.key, item.v)}>
									{#if copied === item.key}<Check />{:else}<Copy />{/if}
								</Button>
							</div>
						</div>
					{/each}
				</dl>
			</Card.Content>
		</Card.Root>
	{:else}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
		>
			{result.error}
		</div>
	{/if}
</main>
