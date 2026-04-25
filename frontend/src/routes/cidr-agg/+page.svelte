<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { aggregate } from "$lib/cidr-agg";

	let input = $state(`10.0.0.0/24
10.0.1.0/24
10.0.2.0-10.0.2.10
10.0.2.11
192.168.1.0/30
192.168.1.4/30
192.168.1.8/29`);

	let result = $derived(aggregate(input));

	let copied = $state(false);
	async function copy() {
		if (!result.ok) return;
		await navigator.clipboard.writeText(result.merged.join("\n"));
		copied = true;
		setTimeout(() => (copied = false), 1500);
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
		<h1 class="text-3xl font-bold tracking-tight">CIDR Aggregator</h1>
		<p class="text-muted-foreground mt-1">
			Merge overlapping or adjacent IPv4 CIDRs/ranges/IPs into the minimal set of CIDRs.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Input</Card.Title>
				<Card.Description>One per line: <code>10.0.0.0/24</code>, <code>10.0.1.0-10.0.1.5</code>, or <code>10.0.2.1</code>.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={input} class="min-h-72 font-mono text-sm" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Merged CIDRs</Card.Title>
				{#if result.ok}
					<Button variant="ghost" size="sm" onclick={copy} disabled={result.merged.length === 0}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
				{/if}
			</Card.Header>
			<Card.Content>
				{#if result.ok}
					<Textarea value={result.merged.join("\n")} readonly class="min-h-56 font-mono text-sm" />
					<dl class="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-xs">
						<div><dt>Input entries:</dt><dd class="font-mono">{result.originalCount}</dd></div>
						<div><dt>Output CIDRs:</dt><dd class="font-mono">{result.merged.length}</dd></div>
						<div class="col-span-2"><dt>Total addresses:</dt><dd class="font-mono">{result.totalAddresses.toString()}</dd></div>
					</dl>
				{:else}
					<div class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
						{result.error}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	{#if result.ok && result.ranges.length > 0}
		<Card.Root class="mt-4">
			<Card.Header><Card.Title class="text-base">Merged ranges</Card.Title></Card.Header>
			<Card.Content>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left">
							<th class="px-2 py-2">Start</th>
							<th class="px-2 py-2">End</th>
							<th class="px-2 py-2">Size</th>
						</tr>
					</thead>
					<tbody>
						{#each result.ranges as r, i (i)}
							<tr class="border-b font-mono last:border-0">
								<td class="px-2 py-1">{r.start}</td>
								<td class="px-2 py-1">{r.end}</td>
								<td class="px-2 py-1">{r.size.toString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
