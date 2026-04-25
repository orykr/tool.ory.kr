<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import ArrowLeftRight from "@lucide/svelte/icons/arrow-left-right";
	import { diffLines, diffStats } from "$lib/diff";

	let left = $state("Hello, world!\nThis is the original.\nLine three.\n");
	let right = $state("Hello, world!\nThis is the modified version.\nLine three.\nNew line.\n");

	let lines = $derived(diffLines(left, right));
	let stats = $derived(diffStats(lines));

	function swap() {
		[left, right] = [right, left];
	}

	function clear() {
		left = "";
		right = "";
	}
</script>

<main class="container mx-auto max-w-6xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">Text Diff</h1>
		<p class="text-muted-foreground mt-1">
			Compare two text snippets line-by-line using an LCS-based diff.
		</p>
	</header>

	<div class="mb-4 grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Original</Card.Title>
				<span class="text-muted-foreground text-xs">{left.split(/\r?\n/).length} lines</span>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={left} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Changed</Card.Title>
				<span class="text-muted-foreground text-xs">{right.split(/\r?\n/).length} lines</span>
			</Card.Header>
			<Card.Content>
				<Textarea bind:value={right} class="min-h-48 font-mono text-sm" />
			</Card.Content>
		</Card.Root>
	</div>

	<div class="mb-4 flex flex-wrap items-center gap-2 text-sm">
		<Button variant="outline" size="sm" onclick={swap}>
			<ArrowLeftRight />
			Swap
		</Button>
		<Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
		<span class="text-muted-foreground ml-auto">
			<span class="text-emerald-600 dark:text-emerald-400">+{stats.added}</span>
			<span class="text-rose-600 dark:text-rose-400 ml-2">−{stats.removed}</span>
			<span class="ml-2">{stats.same} unchanged</span>
		</span>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Diff</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if lines.length === 0}
				<p class="text-muted-foreground text-sm">No content to compare.</p>
			{:else}
				<pre class="overflow-x-auto rounded-md border font-mono text-xs leading-relaxed">{#each lines as line, i (i)}<div class="flex {line.op === 'insert' ? 'bg-emerald-50 dark:bg-emerald-950/40' : line.op === 'delete' ? 'bg-rose-50 dark:bg-rose-950/40' : ''}"><span class="text-muted-foreground w-12 shrink-0 px-2 text-right select-none">{line.leftNumber ?? ''}</span><span class="text-muted-foreground w-12 shrink-0 px-2 text-right select-none">{line.rightNumber ?? ''}</span><span class="w-6 shrink-0 px-1 select-none {line.op === 'insert' ? 'text-emerald-600 dark:text-emerald-400' : line.op === 'delete' ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}">{line.op === 'insert' ? '+' : line.op === 'delete' ? '−' : ' '}</span><span class="px-2 break-all whitespace-pre-wrap">{line.text}</span></div>{/each}</pre>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
