<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";

	function maskFor(prefix: number): string {
		if (prefix === 0) return "0.0.0.0";
		const mask = ((0xffffffff << (32 - prefix)) >>> 0);
		return [
			(mask >>> 24) & 0xff,
			(mask >>> 16) & 0xff,
			(mask >>> 8) & 0xff,
			mask & 0xff
		].join(".");
	}

	function wildcardFor(prefix: number): string {
		if (prefix === 32) return "0.0.0.0";
		const mask = (~((-1) << (32 - prefix))) >>> 0;
		return [
			(mask >>> 24) & 0xff,
			(mask >>> 16) & 0xff,
			(mask >>> 8) & 0xff,
			mask & 0xff
		].join(".");
	}

	function fmtCount(n: number): string {
		if (n >= 1e9) return `${(n / 1e9).toFixed(2).replace(/\.?0+$/, "")}B`;
		if (n >= 1e6) return `${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
		if (n >= 1e3) return `${(n / 1e3).toFixed(2).replace(/\.?0+$/, "")}K`;
		return n.toLocaleString();
	}

	let query = $state("");

	let rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const result: Array<{
			prefix: number;
			mask: string;
			wildcard: string;
			hosts: string;
			class: string;
		}> = [];
		for (let p = 32; p >= 0; p--) {
			const total = Math.pow(2, 32 - p);
			let cls = "";
			if (p >= 24) cls = "/24+ (LAN)";
			else if (p >= 16) cls = "Class B-ish";
			else if (p >= 8) cls = "Class A-ish";
			else cls = "Internet routing";
			const usable = p === 32 ? 1 : p === 31 ? 2 : Math.max(0, total - 2);
			const row = {
				prefix: p,
				mask: maskFor(p),
				wildcard: wildcardFor(p),
				hosts: fmtCount(total) + (p < 31 ? ` (${fmtCount(usable)} usable)` : ""),
				class: cls
			};
			if (
				!q ||
				`/${p}`.includes(q) ||
				row.mask.includes(q) ||
				row.wildcard.includes(q) ||
				row.hosts.toLowerCase().includes(q)
			) {
				result.push(row);
			}
		}
		return result;
	});
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
		<h1 class="text-3xl font-bold tracking-tight">CIDR Subnet Cheatsheet</h1>
		<p class="text-muted-foreground mt-1">
			IPv4 prefix lengths with subnet masks, wildcard masks, and host counts.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by prefix, mask, or host count..." />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="overflow-x-auto pt-6">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Prefix</th>
						<th class="px-2 py-2">Subnet mask</th>
						<th class="px-2 py-2">Wildcard mask</th>
						<th class="px-2 py-2">Addresses</th>
						<th class="px-2 py-2">Class</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.prefix)}
						<tr class="border-b font-mono last:border-0">
							<td class="px-2 py-1 font-semibold">/{r.prefix}</td>
							<td class="px-2 py-1">{r.mask}</td>
							<td class="px-2 py-1">{r.wildcard}</td>
							<td class="px-2 py-1">{r.hosts}</td>
							<td class="text-muted-foreground px-2 py-1 font-sans text-xs">{r.class}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card.Content>
	</Card.Root>
</main>
