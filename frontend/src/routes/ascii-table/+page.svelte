<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import { buildAsciiTable } from "$lib/ascii";

	const ALL = buildAsciiTable();
	let query = $state("");

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return ALL;
		return ALL.filter(
			(e) =>
				String(e.dec).includes(q) ||
				e.hex.toLowerCase().includes(q) ||
				e.oct.includes(q) ||
				e.char.toLowerCase() === q ||
				e.name.toLowerCase().includes(q) ||
				e.category.toLowerCase().includes(q)
		);
	});
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
		<h1 class="text-3xl font-bold tracking-tight">ASCII Table</h1>
		<p class="text-muted-foreground mt-1">
			All 128 ASCII codes in dec/hex/oct/binary, with control character names.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by code, hex, name, or character..." />
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="overflow-x-auto pt-6">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Dec</th>
						<th class="px-2 py-2">Hex</th>
						<th class="px-2 py-2">Oct</th>
						<th class="px-2 py-2">Binary</th>
						<th class="px-2 py-2">Char</th>
						<th class="px-2 py-2">Name</th>
						<th class="px-2 py-2">Category</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as e (e.dec)}
						<tr class="border-b font-mono last:border-0">
							<td class="px-2 py-1">{e.dec}</td>
							<td class="px-2 py-1">0x{e.hex}</td>
							<td class="px-2 py-1">{e.oct}</td>
							<td class="px-2 py-1 text-xs">{e.binary}</td>
							<td class="bg-muted/50 px-2 py-1 text-center">{e.char}</td>
							<td class="px-2 py-1">{e.name}</td>
							<td class="text-muted-foreground px-2 py-1 text-xs">{e.category}</td>
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
