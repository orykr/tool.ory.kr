<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Check from "@lucide/svelte/icons/check";
	import { LATEX_SYMBOLS } from "$lib/latex-symbols";

	let query = $state("");

	let groups = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const filtered = LATEX_SYMBOLS.filter(
			(s) =>
				!q ||
				s.command.toLowerCase().includes(q) ||
				s.rendered.includes(query.trim()) ||
				s.keywords.some((k) => k.includes(q)) ||
				s.category.toLowerCase().includes(q)
		);
		const map = new Map<string, typeof LATEX_SYMBOLS>();
		for (const s of filtered) {
			if (!map.has(s.category)) map.set(s.category, []);
			map.get(s.category)!.push(s);
		}
		return Array.from(map.entries());
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1000);
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
		<h1 class="text-3xl font-bold tracking-tight">LaTeX Symbol Search</h1>
		<p class="text-muted-foreground mt-1">
			Search common math symbols and click to copy the LaTeX command.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by name, keyword, command, or symbol..." />
			</div>
		</Card.Content>
	</Card.Root>

	{#each groups as [cat, items] (cat)}
		<Card.Root class="mb-3">
			<Card.Header class="pb-2">
				<Card.Title class="text-sm">{cat} <span class="text-muted-foreground text-xs">({items.length})</span></Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{#each items as s (s.command)}
						<button
							type="button"
							class="hover:bg-muted relative flex items-center justify-between gap-2 rounded border p-2 text-left text-sm"
							onclick={() => copy(s.command)}
							title={s.command}
						>
							<span class="text-xl">{s.rendered}</span>
							<code class="text-muted-foreground text-xs">{s.command}</code>
							{#if copied === s.command}
								<span class="bg-emerald-500/20 absolute inset-0 flex items-center justify-center rounded">
									<Check class="h-4 w-4" />
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}

	{#if groups.length === 0}
		<Card.Root>
			<Card.Content class="text-muted-foreground py-8 text-center text-sm">
				No matches.
			</Card.Content>
		</Card.Root>
	{/if}
</main>
