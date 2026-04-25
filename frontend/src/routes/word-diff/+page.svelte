<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
	import { wordDiff } from "$lib/word-diff";

	let left = $state("The quick brown fox jumps over the lazy dog.");
	let right = $state("The slow brown fox jumps over a sleepy dog.");

	let diff = $derived(wordDiff(left, right));
	let stats = $derived.by(() => {
		let added = 0;
		let removed = 0;
		let same = 0;
		for (const d of diff) {
			if (d.op === "insert") added++;
			else if (d.op === "delete") removed++;
			else same++;
		}
		return { added, removed, same };
	});

	function swap() {
		[left, right] = [right, left];
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
		<h1 class="text-3xl font-bold tracking-tight">Word-level Diff</h1>
		<p class="text-muted-foreground mt-1">
			Compare two text snippets word by word; useful for prose changes.
		</p>
	</header>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Original</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={left} class="min-h-32 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Changed</Card.Title></Card.Header>
			<Card.Content>
				<Textarea bind:value={right} class="min-h-32 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	<div class="mb-4 flex flex-wrap items-center gap-2 text-sm">
		<Button variant="outline" size="sm" onclick={swap}>
			<ArrowLeftRight />
			Swap
		</Button>
		<span class="text-muted-foreground ml-auto">
			<span class="text-emerald-600 dark:text-emerald-400">+{stats.added}</span>
			<span class="text-rose-600 dark:text-rose-400 ml-2">−{stats.removed}</span>
			<span class="ml-2">{stats.same} same</span>
		</span>
	</div>

	<Card.Root>
		<Card.Header><Card.Title class="text-base">Diff</Card.Title></Card.Header>
		<Card.Content>
			<p class="bg-muted overflow-x-auto rounded-md p-4 text-sm leading-relaxed">{#each diff as d, i (i)}{#if d.op === "insert"}<span class="bg-emerald-200 dark:bg-emerald-800/60">{d.text}</span>{:else if d.op === "delete"}<span class="bg-rose-200 line-through dark:bg-rose-800/60">{d.text}</span>{:else}{d.text}{/if}{/each}</p>
		</Card.Content>
	</Card.Root>
</main>
