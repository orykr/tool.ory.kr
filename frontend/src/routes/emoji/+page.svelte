<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Search from "@lucide/svelte/icons/search";
	import Check from "@lucide/svelte/icons/check";
	import { EMOJIS } from "$lib/emoji";

	let query = $state("");
	let recent = $state<string[]>([]);

	let categories = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const filter = (e: (typeof EMOJIS)[number]) =>
			!q ||
			e.name.toLowerCase().includes(q) ||
			e.keywords.some((k) => k.includes(q)) ||
			e.emoji === query.trim();
		const map = new Map<string, typeof EMOJIS>();
		for (const e of EMOJIS) {
			if (!filter(e)) continue;
			if (!map.has(e.category)) map.set(e.category, []);
			map.get(e.category)!.push(e);
		}
		return Array.from(map.entries());
	});

	let copiedEmoji = $state<string | null>(null);

	async function pick(e: { emoji: string }) {
		await navigator.clipboard.writeText(e.emoji);
		copiedEmoji = e.emoji;
		setTimeout(() => (copiedEmoji = null), 1000);
		recent = [e.emoji, ...recent.filter((r) => r !== e.emoji)].slice(0, 12);
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
		<h1 class="text-3xl font-bold tracking-tight">Emoji Picker</h1>
		<p class="text-muted-foreground mt-1">
			Search by name or keyword and click to copy.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="pt-6">
			<div class="flex items-center gap-2">
				<Search class="text-muted-foreground h-4 w-4" />
				<Input bind:value={query} placeholder="Search by name, keyword, or paste emoji..." />
			</div>
		</Card.Content>
	</Card.Root>

	{#if recent.length}
		<Card.Root class="mb-4">
			<Card.Header><Card.Title class="text-base">Recent</Card.Title></Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-2">
					{#each recent as e (e)}
						<button
							type="button"
							class="hover:bg-muted rounded p-1 text-2xl"
							onclick={() => pick({ emoji: e })}
						>
							{e}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#each categories as [cat, items] (cat)}
		<Card.Root class="mb-3">
			<Card.Header>
				<Card.Title class="text-sm">{cat} <span class="text-muted-foreground text-xs">({items.length})</span></Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-2">
					{#each items as e (e.name)}
						<button
							type="button"
							class="hover:bg-muted relative rounded p-1 text-2xl"
							title={e.name}
							onclick={() => pick(e)}
						>
							{e.emoji}
							{#if copiedEmoji === e.emoji}
								<span class="bg-emerald-500 text-primary-foreground absolute -top-1 -right-1 rounded-full p-0.5">
									<Check class="h-3 w-3" />
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}

	{#if categories.length === 0}
		<Card.Root>
			<Card.Content class="text-muted-foreground py-8 text-center text-sm">
				No matches.
			</Card.Content>
		</Card.Root>
	{/if}
</main>
