<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { HTTP_HEADERS } from "$lib/http-headers";

	let query = $state("");
	let activeCategory = $state<"All" | "Request" | "Response" | "Both" | "Security">("All");

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return HTTP_HEADERS.filter((h) => {
			if (activeCategory !== "All" && h.category !== activeCategory) return false;
			if (!q) return true;
			return (
				h.name.toLowerCase().includes(q) ||
				h.description.toLowerCase().includes(q) ||
				(h.example?.toLowerCase().includes(q) ?? false)
			);
		});
	});

	let copied = $state<string | null>(null);
	async function copy(value: string) {
		await navigator.clipboard.writeText(value);
		copied = value;
		setTimeout(() => (copied = null), 1200);
	}

	function colorFor(category: HeaderEntry["category"]): string {
		if (category === "Request") return "bg-sky-500";
		if (category === "Response") return "bg-emerald-500";
		if (category === "Security") return "bg-rose-500";
		return "bg-violet-500";
	}

	type HeaderEntry = (typeof HTTP_HEADERS)[number];
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
		<h1 class="text-3xl font-bold tracking-tight">HTTP Headers Reference</h1>
		<p class="text-muted-foreground mt-1">
			Common HTTP headers — request, response, CORS, and security.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-3 pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search headers..." />
			</div>
			<div class="flex flex-wrap gap-1">
				{#each ["All", "Request", "Response", "Both", "Security"] as cat (cat)}
					<button
						type="button"
						class="rounded border px-2 py-1 text-xs {activeCategory === cat
							? 'bg-primary text-primary-foreground border-primary'
							: 'bg-background hover:bg-muted'}"
						onclick={() => (activeCategory = cat as typeof activeCategory)}
					>
						{cat}
					</button>
				{/each}
			</div>
			<p class="text-muted-foreground text-xs">{filtered.length} of {HTTP_HEADERS.length}</p>
		</Card.Content>
	</Card.Root>

	<div class="space-y-2">
		{#each filtered as h (h.name)}
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<span class="inline-block h-2 w-2 rounded-full {colorFor(h.category)}"></span>
							<code class="font-semibold">{h.name}</code>
							<span class="text-muted-foreground text-xs">{h.category}</span>
						</div>
						{#if h.example}
							<Button variant="ghost" size="sm" onclick={() => copy(`${h.name}: ${h.example}`)}>
								{#if copied === `${h.name}: ${h.example}`}<Check />{:else}<Copy />{/if}
							</Button>
						{/if}
					</div>
					<p class="text-muted-foreground mt-1 text-sm">{h.description}</p>
					{#if h.example}
						<p class="bg-muted mt-2 rounded p-2 font-mono text-xs break-all">{h.example}</p>
					{/if}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</main>
