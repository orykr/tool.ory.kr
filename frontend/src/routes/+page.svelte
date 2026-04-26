<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { categories, allTools } from "$lib/tools";
	import Search from "@lucide/svelte/icons/search";
	import X from "@lucide/svelte/icons/x";

	let query = $state("");

	type ToolItem = (typeof allTools)[number];
	type Section = { id: string; label: string; tools: ToolItem[] };

	let sections = $derived.by<Section[]>(() => {
		const q = query.trim().toLowerCase();
		if (!q) return categories.map((c) => ({ id: c.id, label: c.label, tools: c.tools }));
		const out: Section[] = [];
		for (const c of categories) {
			const matches = c.tools.filter(
				(t) =>
					t.title.toLowerCase().includes(q) ||
					t.description.toLowerCase().includes(q) ||
					t.href.toLowerCase().includes(q)
			);
			if (matches.length) out.push({ id: c.id, label: c.label, tools: matches });
		}
		return out;
	});

	let totalMatches = $derived(sections.reduce((n, c) => n + c.tools.length, 0));
</script>

<main class="container mx-auto max-w-7xl px-6 py-10">
	<header class="mb-8 border-b pb-6">
		<h1 class="text-4xl font-bold tracking-tight">ORY TOOLS</h1>
		<p class="text-muted-foreground mt-2">
			{allTools.length} browser-based tools across {categories.length} categories. Everything runs locally — no data leaves your machine.
		</p>
	</header>

	<div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="relative max-w-md flex-1">
			<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
			<Input bind:value={query} placeholder="Search by name, keyword, or path…" class="pl-8 pr-8" />
			{#if query}
				<button
					type="button"
					onclick={() => (query = "")}
					class="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5"
					aria-label="Clear search"
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>
		<div class="text-muted-foreground text-sm">
			{#if query}
				Showing {totalMatches} of {allTools.length} tools
			{:else}
				{allTools.length} tools
			{/if}
		</div>
	</div>

	{#if !query}
		<nav class="mb-8 flex flex-wrap gap-2">
			{#each categories as cat (cat.id)}
				<a
					href="#cat-{cat.id}"
					class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
				>
					{cat.label}
					<span class="text-muted-foreground text-xs">{cat.tools.length}</span>
				</a>
			{/each}
		</nav>
	{/if}

	{#if totalMatches === 0}
		<p class="text-muted-foreground py-12 text-center">No tools match "{query}".</p>
	{:else}
		<div class="space-y-10">
			{#each sections as section (section.id)}
				<section id="cat-{section.id}" class="scroll-mt-24">
					<div class="mb-4 flex items-baseline justify-between border-b pb-2">
						<h2 class="text-xl font-semibold tracking-tight">{section.label}</h2>
						<span class="text-muted-foreground text-sm">{section.tools.length} tools</span>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each section.tools as tool (tool.href)}
							<a
								href={tool.href}
								class="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
							>
								<Card.Root
									class="hover:border-foreground/20 h-full transition-all hover:-translate-y-1 hover:shadow-md"
								>
									<Card.Header>
										<Card.Title class="text-primary text-base">{tool.title}</Card.Title>
										<Card.Description class="line-clamp-2">{tool.description}</Card.Description>
									</Card.Header>
								</Card.Root>
							</a>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</main>
