<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import { HTTP_STATUSES } from "$lib/http-status";

	let query = $state("");

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return HTTP_STATUSES;
		return HTTP_STATUSES.filter(
			(s) =>
				String(s.code).includes(q) ||
				s.name.toLowerCase().includes(q) ||
				s.description.toLowerCase().includes(q)
		);
	});

	let groups = $derived.by(() => {
		const map = new Map<string, typeof HTTP_STATUSES>();
		for (const s of filtered) {
			if (!map.has(s.category)) map.set(s.category, []);
			map.get(s.category)!.push(s);
		}
		return Array.from(map.entries());
	});

	function colorFor(code: number): string {
		if (code < 200) return "bg-slate-500";
		if (code < 300) return "bg-emerald-500";
		if (code < 400) return "bg-amber-500";
		if (code < 500) return "bg-rose-500";
		return "bg-red-700";
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
		<h1 class="text-3xl font-bold tracking-tight">HTTP Status Codes</h1>
		<p class="text-muted-foreground mt-1">
			Quick reference for common HTTP status codes.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input
					bind:value={query}
					placeholder="Search by code, name, or description..."
					class="font-mono"
				/>
			</div>
			<p class="text-muted-foreground mt-2 text-xs">
				{filtered.length} of {HTTP_STATUSES.length}
			</p>
		</Card.Content>
	</Card.Root>

	{#each groups as [category, items] (category)}
		<Card.Root class="mb-3">
			<Card.Header>
				<Card.Title class="text-sm">{category}</Card.Title>
			</Card.Header>
			<Card.Content>
				<ul class="divide-y">
					{#each items as s (s.code)}
						<li class="flex items-start gap-3 py-2">
							<span
								class="mt-0.5 inline-flex h-7 min-w-12 items-center justify-center rounded-md {colorFor(
									s.code
								)} px-2 text-xs font-bold text-white"
							>
								{s.code}
							</span>
							<div class="flex-1">
								<p class="text-sm font-semibold">{s.name}</p>
								<p class="text-muted-foreground text-xs">{s.description}</p>
							</div>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/each}

	{#if filtered.length === 0}
		<Card.Root>
			<Card.Content class="text-muted-foreground py-8 text-center text-sm">
				No matches.
			</Card.Content>
		</Card.Root>
	{/if}
</main>
