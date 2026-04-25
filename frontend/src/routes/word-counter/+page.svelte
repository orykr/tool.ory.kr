<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";

	let text = $state("");

	let stats = $derived.by(() => {
		const characters = text.length;
		const charactersNoSpaces = text.replace(/\s/g, "").length;
		const trimmed = text.trim();
		const words = trimmed ? trimmed.split(/\s+/).length : 0;
		const sentences = trimmed
			? trimmed.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim().length > 0).length
			: 0;
		const paragraphs = trimmed
			? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
			: 0;
		const lines = text.split(/\r?\n/).length;
		const bytes = new TextEncoder().encode(text).length;
		const readingMinutes = words / 200;
		const speakingMinutes = words / 130;
		return {
			characters,
			charactersNoSpaces,
			words,
			sentences,
			paragraphs,
			lines,
			bytes,
			readingTime: formatMinutes(readingMinutes),
			speakingTime: formatMinutes(speakingMinutes)
		};
	});

	function formatMinutes(minutes: number): string {
		if (minutes < 1 / 60) return "<1s";
		if (minutes < 1) return `${Math.round(minutes * 60)}s`;
		const m = Math.floor(minutes);
		const s = Math.round((minutes - m) * 60);
		return s === 0 ? `${m} min` : `${m} min ${s}s`;
	}

	let topWords = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const word of text.toLowerCase().match(/\p{L}[\p{L}\p{N}'-]*/gu) ?? []) {
			counts.set(word, (counts.get(word) ?? 0) + 1);
		}
		return Array.from(counts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);
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
		<h1 class="text-3xl font-bold tracking-tight">Word Counter</h1>
		<p class="text-muted-foreground mt-1">
			Live text statistics — characters, words, sentences, reading time, and top words.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Text</Card.Title></Card.Header>
		<Card.Content>
			<Textarea bind:value={text} class="min-h-48 font-mono text-sm" placeholder="Type or paste text..." />
		</Card.Content>
	</Card.Root>

	<Card.Root class="mb-4">
		<Card.Header><Card.Title class="text-base">Statistics</Card.Title></Card.Header>
		<Card.Content>
			<dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each [
					{ k: "Characters", v: stats.characters },
					{ k: "No spaces", v: stats.charactersNoSpaces },
					{ k: "Words", v: stats.words },
					{ k: "Sentences", v: stats.sentences },
					{ k: "Paragraphs", v: stats.paragraphs },
					{ k: "Lines", v: stats.lines },
					{ k: "Bytes (UTF-8)", v: stats.bytes },
					{ k: "Reading time", v: stats.readingTime },
					{ k: "Speaking time", v: stats.speakingTime }
				] as item, i (i)}
					<div class="bg-muted rounded-md p-3">
						<dt class="text-muted-foreground text-xs">{item.k}</dt>
						<dd class="font-mono text-lg">{item.v}</dd>
					</div>
				{/each}
			</dl>
		</Card.Content>
	</Card.Root>

	{#if topWords.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Most frequent words</Card.Title>
			</Card.Header>
			<Card.Content>
				<ol class="space-y-1">
					{#each topWords as [word, count], i (word)}
						<li class="bg-muted flex items-center justify-between rounded px-3 py-1 text-sm">
							<span><span class="text-muted-foreground mr-2">{i + 1}.</span><span class="font-mono">{word}</span></span>
							<span class="text-muted-foreground font-mono text-xs">{count}</span>
						</li>
					{/each}
				</ol>
			</Card.Content>
		</Card.Root>
	{/if}
</main>
