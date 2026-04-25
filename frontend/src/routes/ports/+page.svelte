<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import { PORTS } from "$lib/ports";

	let query = $state("");

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return PORTS;
		return PORTS.filter(
			(p) =>
				String(p.port).includes(q) ||
				p.service.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.protocol.includes(q)
		);
	});

	function categoryFor(port: number): string {
		if (port < 1024) return "well-known";
		if (port < 49152) return "registered";
		return "dynamic";
	}

	function colorFor(port: number): string {
		if (port < 1024) return "bg-emerald-500";
		if (port < 49152) return "bg-amber-500";
		return "bg-rose-500";
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">TCP/UDP Port Reference</h1>
		<p class="text-muted-foreground mt-1">
			Common port numbers, protocols, and the services associated with them.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by port, service, protocol, or keyword..." />
			</div>
			<p class="text-muted-foreground mt-2 text-xs">
				{filtered.length} of {PORTS.length} · 0–1023 well-known · 1024–49151 registered · 49152–65535 dynamic
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="overflow-x-auto pt-6">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Port</th>
						<th class="px-2 py-2">Protocol</th>
						<th class="px-2 py-2">Service</th>
						<th class="px-2 py-2">Description</th>
						<th class="px-2 py-2">Range</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as p (`${p.port}-${p.service}-${p.protocol}`)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1 font-mono font-semibold">{p.port}</td>
							<td class="px-2 py-1 font-mono text-xs">{p.protocol}</td>
							<td class="px-2 py-1 font-mono">{p.service}</td>
							<td class="text-muted-foreground px-2 py-1">{p.description}</td>
							<td class="px-2 py-1">
								<span
									class="inline-block h-2 w-2 rounded-full {colorFor(p.port)} align-middle"
								></span>
								<span class="text-muted-foreground ml-1 text-xs">{categoryFor(p.port)}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if filtered.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">No matches.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
