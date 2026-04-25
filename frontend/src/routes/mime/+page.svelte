<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { MIME_TYPES } from "$lib/mime";

	let query = $state("");

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return MIME_TYPES;
		return MIME_TYPES.filter(
			(m) =>
				m.extension.toLowerCase().includes(q) ||
				m.type.toLowerCase().includes(q) ||
				m.description.toLowerCase().includes(q)
		);
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1200);
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
		<h1 class="text-3xl font-bold tracking-tight">MIME Type Lookup</h1>
		<p class="text-muted-foreground mt-1">
			Search common file extensions and their MIME types.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by extension, MIME type, or description..." />
			</div>
			<p class="text-muted-foreground mt-2 text-xs">
				{filtered.length} of {MIME_TYPES.length}
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="pt-6">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b text-left">
						<th class="px-2 py-2">Extension</th>
						<th class="px-2 py-2">MIME Type</th>
						<th class="px-2 py-2">Description</th>
						<th class="px-2 py-2"></th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as m, i (i)}
						<tr class="border-b last:border-0">
							<td class="px-2 py-1.5 font-mono">.{m.extension}</td>
							<td class="px-2 py-1.5 font-mono break-all">{m.type}</td>
							<td class="text-muted-foreground px-2 py-1.5">{m.description}</td>
							<td class="px-2 py-1.5 text-right">
								<Button variant="ghost" size="sm" onclick={() => copy(m.type)}>
									{#if copied === m.type}<Check />{:else}<Copy />{/if}
								</Button>
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
